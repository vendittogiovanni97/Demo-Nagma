/**
 * BookingHistoryRepository Tests - N+1 Query Optimization Verification
 *
 * These tests verify that the N+1 optimization is working correctly:
 * - findById loads all relationships in 1 query
 * - findAll loads all relationships in 1 query
 * - findAllPaged loads all relationships in 2 queries (findMany + count)
 * - All returned objects have booking, customer, artist, user data available
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient, BookingHistory, BookingAction } from '@prisma/client';
import { BookingHistoryRepository } from '../booking-history.repository';
import { QueryCounterAdapter } from '../../../utils/query-counter'; // Helper to count SQL queries

describe('BookingHistoryRepository - N+1 Optimization Tests', () => {
  let prisma: PrismaClient;
  let repo: BookingHistoryRepository;
  let queryCounter: QueryCounterAdapter;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repo = new BookingHistoryRepository(prisma);
    queryCounter = new QueryCounterAdapter(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ============================================================================
  // TEST 1: findById - Single Query Optimization
  // ============================================================================

  describe('findById - Single Query Optimization', () => {
    it('should load a booking history with all relationships in 1 query', async () => {
      const queryCount = await queryCounter.countQueries(async () => {
        const history = await repo.findById(1);
        expect(history).toBeDefined();
      });

      // Expect: 1 query (findUnique with include)
      expect(queryCount).toBe(1);
    });

    it('should return booking with customer and artist data', async () => {
      const history = await repo.findById(1);

      expect(history).toBeDefined();
      expect(history?.booking).toBeDefined();
      expect(history?.booking.customer).toBeDefined();
      expect(history?.booking.artist).toBeDefined();
      expect(history?.changedBy).toBeDefined();
    });

    it('should not require additional queries to access booking details', async () => {
      const history = await repo.findById(1);

      // These should not trigger additional queries (relationships already loaded)
      const queryCount = await queryCounter.countQueries(async () => {
        const customerName = `${history?.booking.customer.firstName} ${history?.booking.customer.lastName}`;
        const artistName = history?.booking.artist?.name;
        expect(customerName).toBeDefined();
        expect(artistName).toBeDefined();
      });

      // No additional queries should be made
      expect(queryCount).toBe(0);
    });

    it('should include only necessary customer fields (not sensitive data)', async () => {
      const history = await repo.findById(1);
      const customer = history?.booking.customer;

      // Should have these fields
      expect(customer?.id).toBeDefined();
      expect(customer?.firstName).toBeDefined();
      expect(customer?.lastName).toBeDefined();
      expect(customer?.phone).toBeDefined();
      expect(customer?.email).toBeDefined();

      // Should NOT fetch these (not in select clause)
      // These would be undefined due to explicit field selection
      expect(customer?.notes).toBeUndefined();
    });
  });

  // ============================================================================
  // TEST 2: findAll - Single Query Optimization
  // ============================================================================

  describe('findAll - Single Query Optimization', () => {
    it('should load all booking histories with relationships in 1 query', async () => {
      const queryCount = await queryCounter.countQueries(async () => {
        const histories = await repo.findAll();
        expect(histories.length).toBeGreaterThan(0);
      });

      // Expect: 1 query (findMany with include)
      expect(queryCount).toBe(1);
    });

    it('should return all records with complete relationship data', async () => {
      const histories = await repo.findAll();

      histories.forEach((history) => {
        expect(history.booking).toBeDefined();
        expect(history.booking.customer).toBeDefined();
        expect(history.booking.customer.firstName).toBeDefined();
        expect(history.changedBy).toBeDefined();
      });
    });

    it('should not trigger N+1 when iterating and accessing relationships', async () => {
      const histories = await repo.findAll();

      // This is the typical N+1 scenario: iterating and accessing relationships
      const queryCount = await queryCounter.countQueries(async () => {
        for (const history of histories) {
          const customerFullName = `${history.booking.customer.firstName} ${history.booking.customer.lastName}`;
          const artistName = history.booking.artist?.name ?? 'Unassigned';
          const changedByName = history.changedBy?.name ?? 'System';
          // Use values to prevent optimization
          expect(customerFullName).toBeDefined();
          expect(artistName).toBeDefined();
          expect(changedByName).toBeDefined();
        }
      });

      // Should be 0 additional queries (all relationships already loaded)
      expect(queryCount).toBe(0);
    });
  });

  // ============================================================================
  // TEST 3: findAllPaged - Batch Loading Optimization
  // ============================================================================

  describe('findAllPaged - Batch Loading Optimization', () => {
    it('should load paginated results with relationships in exactly 2 queries', async () => {
      const queryCount = await queryCounter.countQueries(async () => {
        const result = await repo.findAllPaged({ page: 1, limit: 10 });
        expect(result.data.length).toBeLessThanOrEqual(10);
      });

      // Expect: 2 queries
      // Query 1: findMany with include (batch-loads all relationships)
      // Query 2: count for pagination metadata
      expect(queryCount).toBe(2);
    });

    it('should reduce from 42 queries to 2 queries for 10 records', async () => {
      // Before optimization: 2 (list + count) + 4*10 (relationships) = 42 queries
      // After optimization: 2 queries

      const queryCount = await queryCounter.countQueries(async () => {
        const result = await repo.findAllPaged({ page: 1, limit: 10 });

        // This loop would have caused 40 additional queries before optimization
        for (const history of result.data) {
          const booking = history.booking;
          const customer = booking.customer;
          const artist = booking.artist;
          const changedBy = history.changedBy;

          expect(booking).toBeDefined();
          expect(customer).toBeDefined();
          expect(artist).toBeDefined();
          expect(changedBy).toBeDefined();
        }
      });

      // Should still be 2 (no additional queries during iteration)
      expect(queryCount).toBe(2);
    });

    it('should respect date range filters', async () => {
      const startDate = new Date('2026-04-01').toISOString();
      const endDate = new Date('2026-04-29').toISOString();

      const result = await repo.findAllPaged({
        page: 1,
        limit: 10,
        startDate,
        endDate,
      });

      result.data.forEach((history) => {
        const changedAt = new Date(history.changedAt);
        expect(changedAt.getTime()).toBeGreaterThanOrEqual(new Date(startDate).getTime());
        expect(changedAt.getTime()).toBeLessThanOrEqual(new Date(endDate).getTime());
      });
    });

    it('should filter by action type efficiently', async () => {
      const result = await repo.findAllPaged({
        page: 1,
        limit: 10,
        action: BookingAction.CREATED,
      });

      result.data.forEach((history) => {
        expect(history.action).toBe(BookingAction.CREATED);
      });
    });

    it('should filter by changedBy user efficiently', async () => {
      const userId = 1;
      const result = await repo.findAllPaged({
        page: 1,
        limit: 10,
        changedBy: userId.toString(),
      });

      result.data.forEach((history) => {
        expect(history.changedById).toBe(userId);
      });
    });

    it('should return correct pagination metadata', async () => {
      const result = await repo.findAllPaged({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  // ============================================================================
  // TEST 4: Create - Relationship Consistency
  // ============================================================================

  describe('create - Relationship Consistency', () => {
    it('should return created record with relationships loaded', async () => {
      const newHistory = await repo.create({
        booking: { connect: { id: 1 } },
        action: BookingAction.CREATED,
        changedById: 1,
      });

      expect(newHistory).toBeDefined();
      expect(newHistory.booking).toBeDefined();
      expect(newHistory.booking.customer).toBeDefined();
      expect(newHistory.changedBy).toBeDefined();
    });
  });

  // ============================================================================
  // TEST 5: Update - Relationship Consistency
  // ============================================================================

  describe('update - Relationship Consistency', () => {
    it('should return updated record with relationships loaded', async () => {
      const updated = await repo.update(1, {
        action: BookingAction.UPDATED,
      });

      expect(updated).toBeDefined();
      expect(updated.booking).toBeDefined();
      expect(updated.booking.customer).toBeDefined();
      expect(updated.changedBy).toBeDefined();
    });
  });

  // ============================================================================
  // TEST 6: Field Selection Validation
  // ============================================================================

  describe('Field Selection - Optimize Payload', () => {
    it('should only fetch specified customer fields', async () => {
      const history = await repo.findById(1);
      const customer = history?.booking.customer;

      // Selected fields should exist
      const selectedFields = ['id', 'firstName', 'lastName', 'phone', 'email'];
      selectedFields.forEach((field) => {
        expect(customer).toHaveProperty(field);
      });

      // Non-selected fields should NOT exist (due to explicit select)
      const nonSelectedFields = ['notes', 'deletedAt', 'createdAt'];
      nonSelectedFields.forEach((field) => {
        expect(customer?.[field]).toBeUndefined();
      });
    });

    it('should only fetch specified artist (staff) fields', async () => {
      const history = await repo.findById(1);
      const artist = history?.booking.artist;

      if (artist) {
        const selectedFields = ['id', 'name', 'type', 'color'];
        selectedFields.forEach((field) => {
          expect(artist).toHaveProperty(field);
        });
      }
    });

    it('should only fetch specified user fields', async () => {
      const history = await repo.findById(1);
      const changedBy = history?.changedBy;

      if (changedBy) {
        const selectedFields = ['id', 'name', 'email', 'role'];
        selectedFields.forEach((field) => {
          expect(changedBy).toHaveProperty(field);
        });
      }
    });
  });

  // ============================================================================
  // TEST 7: Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle null changedBy gracefully', async () => {
      // Some histories might have null changedBy
      const histories = await repo.findAll();
      const historyWithNullUser = histories.find((h) => h.changedById === null);

      if (historyWithNullUser) {
        expect(historyWithNullUser.changedBy).toBeNull();
      }
    });

    it('should handle null artist gracefully', async () => {
      const histories = await repo.findAll();
      const historyWithNullArtist = histories.find((h) => h.booking.artistId === null);

      if (historyWithNullArtist) {
        expect(historyWithNullArtist.booking.artist).toBeNull();
      }
    });

    it('should maintain ordering (descending by changedAt)', async () => {
      const histories = await repo.findAll();

      for (let i = 0; i < histories.length - 1; i++) {
        const current = new Date(histories[i].changedAt).getTime();
        const next = new Date(histories[i + 1].changedAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });
});

/**
 * Helper Class: QueryCounterAdapter
 *
 * Counts the number of SQL queries executed.
 * In a real test, you would use:
 * - Prisma event API: prisma.$on('query', ...)
 * - Database profiling tools
 * - Custom instrumentation
 *
 * Example implementation:
 *
 * class QueryCounterAdapter {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async countQueries(fn: () => Promise<any>): Promise<number> {
 *     let queryCount = 0;
 *     const listener = prisma.$on('query', () => { queryCount++; });
 *     try {
 *       await fn();
 *     } finally {
 *       listener();
 *     }
 *     return queryCount;
 *   }
 * }
 */
