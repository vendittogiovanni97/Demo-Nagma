"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Calendar, Users, UsersRound, CircleDollarSign, Plus } from 'lucide-react';
import BookingModal from '@/components/BookingModal';

export default function Navbar() {
  const pathname = usePathname();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/', icon: LayoutGrid },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    { name: 'Clienti', href: '/clienti', icon: Users },
    { name: 'Team', href: '/team', icon: UsersRound },
    { name: 'Spese', href: '/spese', icon: CircleDollarSign },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90%]">
      <div className="bg-[#0a1a26]/80 backdrop-blur-[20px] border-[1.5px] border-surface-border rounded-full py-3 px-6 flex items-center gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(0,191,255,0.15)]">
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex flex-col items-center gap-1 transition-all duration-200 p-2 ${
                isActive 
                  ? 'text-accent -translate-y-[2px]' 
                  : 'text-text-secondary hover:text-accent hover:-translate-y-[2px]'
              }`}
            >
              <Icon size={24} />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.5px] font-outfit">
                {item.name}
              </span>
            </Link>
          );
        })}

        <div className="w-[1px] h-[30px] bg-surface-border" />

        <button 
          onClick={() => setIsBookingOpen(true)}
          className="bg-accent text-black w-[45px] h-[45px] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90 hover:shadow-[0_0_20px_var(--color-accent)] cursor-pointer"
        >
          <Plus size={28} />
        </button>
      </div>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </nav>
  );
}
