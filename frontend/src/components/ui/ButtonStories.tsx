"use client";

/**
 * Esempi di utilizzo del componente Button
 * Questa pagina mostra tutte le varianti, size e stati disponibili
 *
 * Per usare questi esempi:
 * 1. Vai su http://localhost:3000/button-stories
 * 2. Scrivi una route dinamica in app/button-stories/page.tsx che importa questo componente
 */

import { useState } from 'react';
import { Heart, Download, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import Button from './Button';

export default function ButtonStories() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Button Component Stories</h1>
        <p className="text-text-secondary mb-12">Tutti gli stati e varianti del componente Button</p>

        {/* VARIANTI */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Varianti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-sidebar p-8 rounded-[30px] border border-surface-border">
            <div className="flex flex-col gap-3">
              <label className="text-sm text-text-secondary">Primary (Default)</label>
              <Button variant="primary">Accedi</Button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm text-text-secondary">Secondary</label>
              <Button variant="secondary">Annulla</Button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm text-text-secondary">Glass</label>
              <Button variant="glass">Esplora</Button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm text-text-secondary">Danger</label>
              <Button variant="danger">Elimina</Button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm text-text-secondary">Success</label>
              <Button variant="success">Salva</Button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm text-text-secondary">Ghost</label>
              <Button variant="ghost">Link</Button>
            </div>
          </div>
        </section>

        {/* SIZE */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Dimensioni</h2>
          <div className="flex flex-col gap-4 bg-sidebar p-8 rounded-[30px] border border-surface-border">
            <div className="flex items-center gap-4">
              <label className="text-sm text-text-secondary w-20">Small</label>
              <Button size="sm">Click me</Button>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-text-secondary w-20">Medium</label>
              <Button size="md">Click me</Button>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-text-secondary w-20">Large</label>
              <Button size="lg">Click me</Button>
            </div>
          </div>
        </section>

        {/* CON ICON */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Con Icon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-sidebar p-8 rounded-[30px] border border-surface-border">
            <Button variant="primary" icon={<Heart size={20} />}>
              Like
            </Button>
            <Button variant="secondary" icon={<Download size={20} />}>
              Scarica
            </Button>
            <Button variant="danger" icon={<AlertCircle size={20} />}>
              Attenzione
            </Button>
            <Button variant="success" icon={<CheckCircle2 size={20} />}>
              Confermo
            </Button>
            <Button variant="glass" icon={<Settings size={20} />}>
              Impostazioni
            </Button>
            <Button variant="ghost" icon={<Download size={20} />}>
              Ancora
            </Button>
          </div>
        </section>

        {/* LOADING STATE */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Loading State</h2>
          <div className="flex flex-col gap-4 bg-sidebar p-8 rounded-[30px] border border-surface-border">
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="primary"
                isLoading={loading}
                loadingLabel="Autenticazione..."
                onClick={handleClick}
              >
                Login
              </Button>
              <Button
                variant="secondary"
                isLoading={loading}
                loadingLabel="Salvataggio..."
                onClick={handleClick}
              >
                Salva
              </Button>
              <Button
                variant="danger"
                isLoading={loading}
                loadingLabel="Eliminazione..."
                onClick={handleClick}
              >
                Elimina
              </Button>
            </div>
            <p className="text-xs text-text-secondary">
              Clicca un bottone per simulare lo stato di caricamento (2 secondi)
            </p>
          </div>
        </section>

        {/* STATI DISABLED */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Stati Disabled</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-sidebar p-8 rounded-[30px] border border-surface-border">
            <div className="flex flex-col gap-3">
              <label className="text-sm text-text-secondary">Primary Disabled</label>
              <Button variant="primary" disabled>
                Disabilitato
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm text-text-secondary">Secondary Disabled</label>
              <Button variant="secondary" disabled>
                Disabilitato
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm text-text-secondary">Glass Disabled</label>
              <Button variant="glass" disabled>
                Disabilitato
              </Button>
            </div>
          </div>
        </section>

        {/* FULL WIDTH */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Full Width</h2>
          <div className="flex flex-col gap-4 bg-sidebar p-8 rounded-[30px] border border-surface-border">
            <Button variant="primary" fullWidth>
              Full Width Primary Button
            </Button>
            <Button variant="secondary" fullWidth>
              Full Width Secondary Button
            </Button>
          </div>
        </section>

        {/* UTILIZZO NEL CODICE */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Come Usarlo</h2>
          <div className="bg-sidebar p-8 rounded-[30px] border border-surface-border overflow-x-auto">
            <pre className="text-sm text-text-secondary font-mono">
              {`import Button from '@/components/ui/Button';
import { Heart } from 'lucide-react';

// Basic usage
<Button>Click me</Button>

// Con variante
<Button variant="secondary">Annulla</Button>

// Con icon
<Button variant="primary" icon={<Heart size={20} />}>
  Like
</Button>

// Con loading state
<Button isLoading={loading} loadingLabel="Salvataggio...">
  Salva
</Button>

// Full width e custom className
<Button fullWidth variant="danger">
  Elimina
</Button>`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
