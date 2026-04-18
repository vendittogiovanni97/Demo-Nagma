"use client";

import { branding } from "@/config/branding";
import { useAuth } from "@/context/AuthContext";
import { canManageFormTemplates, canSendWhatsApp } from "@/utils/permissions";
import * as Popover from "@radix-ui/react-popover";
import {
  Calendar,
  FileText,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Plus,
  Receipt,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import BookingModal from "../modals/BookingModal";

function getInitials(name?: string, email?: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase() || first.toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  // --------------------------------------------------------------
  // 1️⃣  Evita il primo render nullo sul server
  // --------------------------------------------------------------
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthChecked(true);
  }, []); // esegue solo sul client dopo il mount

  // Prima che l’autenticazione sia verificata restituiamo un <nav> vuoto
  // (o con uno scheletro leggero) così l’albero è identico su server/client.
  if (!authChecked) {
    return (
      <nav
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90%]"
      >
        {/* eventuale scheletro o niente – importante che sia sempre un <nav> */}
      </nav>
    );
  }

  // --------------------------------------------------------------
  // 2️⃣  Se l’utente non è autenticato, mostriamo comunque un <nav>
  // --------------------------------------------------------------
  if (!isAuthenticated) {
    if (pathname === '/login') return null; // Nascondiamo doppi loghi
    return (
      <nav
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90%]"
      >
        {/* Puoi scegliere di mostrare solo il logo o lasciare vuoto */}
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
        </div>
      </nav>
    );
  }

  // --------------------------------------------------------------
  // 3️⃣  Utente autenticato → render completo (invariato rispetto al tuo codice)
  // --------------------------------------------------------------
  const navItems = [
    { name: "Home", href: "/", icon: LayoutGrid },
    { name: "Agenda", href: "/agenda", icon: Calendar },
    { name: "Clienti", href: "/clienti", icon: Users },
    { name: "Team", href: "/team", icon: UsersRound },
  ];

  const initials = getInitials(user?.name, user?.email);
  const canWhatsApp = canSendWhatsApp(user?.role);

  return (
    <>
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

        <div className="w-px h-6.5 bg-surface-border" />

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 p-1.5 ${
                isActive
                  ? "text-accent -translate-y-0.5"
                  : "text-text-secondary hover:text-accent hover:-translate-y-0.5"
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.5px] font-outfit">
                {item.name}
              </span>
            </Link>
          );
        })}

        <div className="w-px h-6.5 bg-surface-border" />

        <Button
          variant="primary"
          size="md"
          icon={<Plus size={22} className="shrink-0" />}
          onClick={() => setIsBookingOpen(true)}
          className="w-9.5 h-9.5 p-0 rounded-full flex items-center justify-center"
        />

        <div className="w-px h-6.5 bg-surface-border mx-1.5" />

        <Popover.Root open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <Popover.Trigger asChild>
            <Button
              variant="ghost"
              size="md"
              className="h-10.5 w-10.5 p-0 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center text-xs font-bold uppercase tracking-wider"
              title={user?.name || user?.email || "Profilo utente"}
              aria-label="Menu utente"
            >
              {initials}
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={14}
              className="z-60 w-60 rounded-2xl border border-surface-border bg-[#0a1a26]/95 backdrop-blur-[20px] p-3 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(0,191,255,0.15)]"
            >
              <div className="px-3 py-2 mb-2 border-b border-surface-border">
                <div className="text-sm font-semibold text-white truncate">
                  {user?.name || "Utente"}
                </div>
                <div className="text-[11px] text-text-secondary truncate">{user?.email}</div>
                {user?.role && (
                  <div className="mt-1 text-[9px] font-bold text-accent uppercase tracking-wider">
                    {user.role}
                  </div>
                )}
              </div>

              <nav className="flex flex-col gap-1">
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center justify-start gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-accent hover:bg-white/5 transition-colors"
                >
                  <Settings size={16} className="shrink-0" />
                  <span>Impostazioni</span>
                </Link>
                {canManageFormTemplates(user?.role) && (
                  <Link
                    href="/form-templates"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center justify-start gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-accent hover:bg-white/5 transition-colors"
                  >
                    <FileText size={16} className="shrink-0" />
                    <span>Form Template</span>
                  </Link>
                )}
                {canWhatsApp && (
                  <Link
                    href="/whatsapp"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center justify-start gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-accent hover:bg-white/5 transition-colors"
                  >
                    <MessageSquare size={16} className="shrink-0" />
                    <span>WhatsApp</span>
                  </Link>
                )}
                <Link
                  href="/spese-libere"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center justify-start gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-accent hover:bg-white/5 transition-colors"
                >
                  <Receipt size={16} className="shrink-0" />
                  <span>Spese Libere</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<LogOut size={16} />}
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="justify-start items-center text-text-secondary hover:text-danger hover:bg-danger/10 px-3"
                >
                  Logout
                </Button>
              </nav>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </nav>

    <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
  </>
  );
}
