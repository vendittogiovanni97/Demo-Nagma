"use client";

import { branding } from '@/config/branding';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      router.push('/');
    } catch {
      setError('Email o password non validi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[70vh]">
      <div className="w-full max-w-md flex flex-col items-center p-8 glass-panel animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center mb-6 border border-surface-border shadow-xl overflow-hidden">
          <Image
            src={branding.portalLogo}
            alt={branding.portalName}
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
        </div>

        <h1 className="text-3xl font-outfit font-bold text-white mb-2">Benvenuto</h1>
        <p className="text-text-secondary text-sm mb-1">{branding.portalName}</p>
        <p className="text-text-secondary text-sm mb-8">{branding.portalLoginTagline}</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-surface-border text-white pl-12 pr-4 py-4 rounded-[15px] focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-surface-border text-white pl-12 pr-12 py-4 rounded-[15px] focus:border-accent focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Accedi'}
          </button>

          {error && (
            <p className="text-danger text-sm text-center mt-1">{error}</p>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary tracking-widest uppercase">
            © 2026 {branding.portalName}
          </p>
        </div>
      </div>
    </div>
  );
}
