"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
    } catch (error) {
      // Errore gestito internamente dal context con toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="glass-panel w-full max-w-md p-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6 border border-accent/30 shadow-[0_0_30px_rgba(0,191,255,0.2)]">
          <Lock className="text-accent" size={32} />
        </div>
        
        <h1 className="text-3xl font-outfit font-bold text-white mb-2">Benvenuto</h1>
        <p className="text-text-secondary text-sm mb-8">Nagma Tattoo Studio Management</p>

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
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-surface-border text-white pl-12 pr-4 py-4 rounded-[15px] focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Accedi'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-text-secondary tracking-widest uppercase">
            © 2026 Nagma Tattoo CRM
          </p>
        </div>
      </div>
    </div>
  );
}
