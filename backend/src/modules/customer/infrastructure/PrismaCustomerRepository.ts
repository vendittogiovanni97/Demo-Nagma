import { PrismaClient } from '@prisma/client';
import { ICustomerRepository, CustomerFilters } from '../contracts/ICustomerRepository';
import { Customer } from '../domain/Customer';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { paginate, buildPagination } from '../../../shared/kernel/pagination';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaCustomerRepository implements ICustomerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapToDomain(raw: any): Customer {
    return new Customer({
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email || undefined,
      phone: raw.phone,
      notes: raw.notes || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  async save(customer: Customer): Promise<Customer> {
    const data = customer.toJSON();
    const created = await this.prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        notes: data.notes,
      },
    });
    return this.mapToDomain(created);
  }

  async findById(id: number): Promise<Customer | null> {
    const raw = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async findAll(): Promise<Customer[]> {
    const raws = await this.prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return raws.map(this.mapToDomain);
  }

  async findAllPaged(filters: CustomerFilters): Promise<IPaginatedResponse<Customer>> {
    const { search, startDate, endDate, page = 1, limit = 20 } = filters;
    
    const where: any = { deletedAt: null };
    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate + 'T23:59:59.999') };
    }
    if (search?.trim()) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { bookings: { where: { deletedAt: null } } }
          }
        }
      }),
      this.prisma.customer.count({ where }),
    ]);

    return paginate(raws.map(this.mapToDomain), total, page, limit);
  }

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    const updated = await this.prisma.customer.update({
      where: { id },
      data: data as any,
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.customer.delete({ where: { id } });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const raw = await this.prisma.customer.findFirst({
      where: { phone, deletedAt: null },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async findByName(firstName: string, lastName: string): Promise<Customer | null> {
    const raw = await this.prisma.customer.findFirst({
      where: { 
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' },
        deletedAt: null 
      },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async getSummary(id: number): Promise<any> {
    const customer = await this.findById(id);
    if (!customer) return null;

    const [aggregateResult, bookingsResult] = await this.prisma.$transaction([
      this.prisma.booking.aggregate({
        where: { customerId: id, status: 'COMPLETATO', deletedAt: null },
        _sum: { price: true },
      }),
      this.prisma.booking.findMany({
        where: { customerId: id, deletedAt: null },
        select: { date: true, status: true, price: true, artist: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    const totalSpent = aggregateResult._sum.price ? aggregateResult._sum.price.toNumber() : 0;
    const upcomingBookings = bookingsResult.filter((b) => b.status === 'CONFERMATO' || b.status === 'CREATO' || b.date > new Date()).length;
    const lastBookingRaw = bookingsResult[0] ?? null;
    const lastBooking = lastBookingRaw
      ? { ...lastBookingRaw, price: lastBookingRaw.price ? lastBookingRaw.price.toNumber() : null }
      : null;

    return {
      ...customer.toJSON(),
      totalSpent,
      upcomingBookings,
      lastBooking,
    };
  }
}
