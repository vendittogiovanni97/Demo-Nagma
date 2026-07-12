import { 
  LayoutGrid, 
  Calendar, 
  CalendarDays, 
  Users, 
  UsersRound 
} from "lucide-react";

export const navItems = [
  { name: "Home",         href: "/",            icon: LayoutGrid   },
  { name: "Agenda",       href: "/agenda",       icon: Calendar     },
  { name: "Prenotazioni", href: "/prenotazioni", icon: CalendarDays },
  { name: "Clienti",      href: "/clienti",      icon: Users        },
  { name: "Staff",        href: "/staff",        icon: UsersRound   },
];
