"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import * as Popover from '@radix-ui/react-popover';
import { LayoutGrid, Calendar, Users, UsersRound, Package, Plus, LogOut, MessageSquare } from 'lucide-react';
import BookingModal from '../modals/BookingModal';
import { useAuth } from '@/context/AuthContext';
import { branding } from '@/config/branding';
import { canSendWhatsApp } from '@/utils/permissions';

function getInitials(name?: string, email?: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase() || first.toUpperCase();
  }
  return (email?.[0] ?? 'U').toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated && pathname === '/login') return null;
  if (!isAuthenticated) return null;

  const navItems = [
    { name: 'Home', href: '/', icon: LayoutGrid },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    { name: 'Clienti', href: '/clienti', icon: Users },
    { name: 'Inventario', href: '/creams', icon: Package },
    { name: 'Team', href: '/team', icon: UsersRound },
  ];

  const initials = getInitials(user?.name, user?.email);
  const canWhatsApp = canSendWhatsApp(user?.role);

  return (
    <nav className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90%]">
      <div className="bg-[#0a1a26]/80 backdrop-blur-[20px] border-[1.5px] border-surface-border rounded-full py-2 px-5 flex items-center gap-5 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(0,191,255,0.15)]">
        <Link href="/" className="flex items-center gap-2.5 pr-1 text-white">
          <div className="h-8 w-8 rounded-full bg-white/5 border border-surface-border flex items-center justify-center overflow-hidden">
            <Image
              src={branding.portalLogo}
              alt={branding.portalName}
              width={22}
              height={22}
              className="h-5 w-5 object-contain"
            />
          </div>
          <span className="hidden md:block text-xs font-outfit font-semibold tracking-[0.4px]">
            {branding.portalShortName}
          </span>
        </Link>

        <div className="w-[1px] h-[26px] bg-surface-border" />

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition-all duration-200 p-1.5 ${
                isActive
                  ? 'text-accent -translate-y-[2px]'
                  : 'text-text-secondary hover:text-accent hover:-translate-y-[2px]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.5px] font-outfit">
                {item.name}
              </span>
            </Link>
          );
        })}

        <div className="w-[1px] h-[26px] bg-surface-border" />

        <button
          onClick={() => setIsBookingOpen(true)}
          className="bg-accent text-black w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90 hover:shadow-[0_0_20px_var(--color-accent)] cursor-pointer"
        >
          <Plus size={22} />
        </button>

        <div className="w-[1px] h-[26px] bg-surface-border mx-1.5" />

        <Popover.Root open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <Popover.Trigger asChild>
            <button
              className="group flex items-center justify-center h-[42px] w-[42px] rounded-full bg-accent/15 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider hover:bg-accent/25 hover:scale-105 transition-all cursor-pointer"
              title={user?.name || user?.email || 'Profilo utente'}
              aria-label="Menu utente"
            >
              {initials}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={14}
              className="z-[60] w-60 rounded-2xl border border-surface-border bg-[#0a1a26]/95 backdrop-blur-[20px] p-3 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(0,191,255,0.15)]"
            >
              <div className="px-3 py-2 mb-2 border-b border-surface-border">
                <div className="text-sm font-semibold text-white truncate">
                  {user?.name || 'Utente'}
                </div>
                <div className="text-[11px] text-text-secondary truncate">{user?.email}</div>
                {user?.role && (
                  <div className="mt-1 text-[9px] font-bold text-accent uppercase tracking-wider">
                    {user.role}
                  </div>
                )}
              </div>

              <nav className="flex flex-col gap-1">
                {canWhatsApp && (
                  <Link
                    href="/whatsapp"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-accent hover:bg-white/5 transition-colors"
                  >
                    <MessageSquare size={16} />
                    <span>WhatsApp</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </nav>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </nav>
  );
}
