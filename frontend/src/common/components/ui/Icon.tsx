'use client';

import {
  AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  Calendar, CalendarDays, Check, CheckCircle, CheckCircle2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, Cloud, Copy,
  DollarSign, Download, Edit, Edit2, Edit3, ExternalLink,
  Eye, EyeOff, FileDown, FileSpreadsheet, FileText,
  Hash, Heart, HelpCircle, Home, Inbox, Info, Loader2,
  Lock, Mail, MapPin, Maximize2, MessageCircle, MoreVertical,
  Music, Package, Palette, Paperclip, PenTool, Pencil, Phone,
  Plus, PlusCircle, RefreshCw, RotateCcw, RotateCw,
  Save, Search, Settings, ShieldCheck, SlidersHorizontal,
  Star, Timer, Trash2, TrendingDown, TrendingUp,
  User, UserCheck, Wallet, X, XCircle, Zap,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  calendar: Calendar,
  calendarDays: CalendarDays,
  check: Check,
  checkCircle: CheckCircle,
  checkCircle2: CheckCircle2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  clock: Clock,
  cloud: Cloud,
  copy: Copy,
  dollarSign: DollarSign,
  download: Download,
  edit: Edit,
  edit2: Edit2,
  edit3: Edit3,
  externalLink: ExternalLink,
  eye: Eye,
  eyeOff: EyeOff,
  fileDown: FileDown,
  fileSpreadsheet: FileSpreadsheet,
  fileText: FileText,
  hash: Hash,
  heart: Heart,
  helpCircle: HelpCircle,
  home: Home,
  inbox: Inbox,
  info: Info,
  loader2: Loader2,
  lock: Lock,
  mail: Mail,
  mapPin: MapPin,
  maximize2: Maximize2,
  messageCircle: MessageCircle,
  moreVertical: MoreVertical,
  music: Music,
  package: Package,
  palette: Palette,
  paperclip: Paperclip,
  penTool: PenTool,
  pencil: Pencil,
  phone: Phone,
  plus: Plus,
  plusCircle: PlusCircle,
  refreshCw: RefreshCw,
  rotateCcw: RotateCcw,
  rotateCw: RotateCw,
  save: Save,
  search: Search,
  settings: Settings,
  shieldCheck: ShieldCheck,
  slidersHorizontal: SlidersHorizontal,
  star: Star,
  timer: Timer,
  trash2: Trash2,
  trendingDown: TrendingDown,
  trendingUp: TrendingUp,
  user: User,
  userCheck: UserCheck,
  wallet: Wallet,
  x: X,
  xCircle: XCircle,
  zap: Zap,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  refresh: RefreshCw,
  colonne: SlidersHorizontal,
  esporta: Download,
  cerca: Search,
  chiudi: X,
  cestino: Trash2,
  modifica: Pencil,
  vedi: Eye,
  piu: Plus,
};

export interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  glow?: boolean;
}

export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className,
  color,
  glow = false,
}: IconProps) {
  const IconComponent = icons[name];
  if (!IconComponent) return <></>;
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
      style={{
        filter: glow ? `drop-shadow(0 0 6px ${color || 'rgba(0, 191, 255, 0.6)'})` : undefined,
        transition: 'all 0.2s ease',
      }}
    />
  );
}

export { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, Calendar, CalendarDays, Check, CheckCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Cloud, Copy, DollarSign, Download, Edit, Edit2, Edit3, ExternalLink, Eye, EyeOff, FileDown, FileSpreadsheet, FileText, Hash, Heart, HelpCircle, Home, Inbox, Info, Loader2, Lock, Mail, MapPin, Maximize2, MessageCircle, MoreVertical, Music, Package, Palette, Paperclip, PenTool, Pencil, Phone, Plus, PlusCircle, RefreshCw, RotateCcw, RotateCw, Save, Search, Settings, ShieldCheck, SlidersHorizontal, Star, Timer, Trash2, TrendingDown, TrendingUp, User, UserCheck, Wallet, X, XCircle, Zap, type LucideIcon } from 'lucide-react';
