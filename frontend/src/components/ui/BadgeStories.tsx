"use client";

import { useState } from 'react';
import Badge from './Badge';
import { CheckCircle, AlertCircle, Info, Zap, Trash2, Star } from 'lucide-react';

/**
 * BadgeStories: Showcase di tutti gli stati e variant del componente Badge
 * Utile per sviluppo, testing e documentazione
 */
export default function BadgeStories() {
  const [removableStates, setRemovableStates] = useState({
    info: true,
    warning: true,
    success: true,
  });

  const handleRemove = (key: keyof typeof removableStates) => {
    setRemovableStates(prev => ({ ...prev, [key]: false }));
  };

  return (
    <div className="space-y-8 p-8 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-white">Badge Component Stories</h1>

      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Variants (Size: SM)</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Sizes (Primary)</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="xs" variant="primary">
            Extra Small
          </Badge>
          <Badge size="sm" variant="primary">
            Small (default)
          </Badge>
          <Badge size="md" variant="primary">
            Medium
          </Badge>
        </div>
      </section>

      {/* With Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">With Icons</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" icon={CheckCircle}>
            Completato
          </Badge>
          <Badge variant="warning" icon={AlertCircle}>
            Attenzione
          </Badge>
          <Badge variant="info" icon={Info}>
            Informazione
          </Badge>
          <Badge variant="primary" icon={Zap}>
            Premium
          </Badge>
        </div>
      </section>

      {/* With Icons - Different Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Icons + Different Sizes</h2>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Badge size="xs" variant="primary" icon={Star}>
              XS
            </Badge>
            <Badge size="sm" variant="primary" icon={Star}>
              SM
            </Badge>
            <Badge size="md" variant="primary" icon={Star}>
              MD
            </Badge>
          </div>
        </div>
      </section>

      {/* Removable Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Removable</h2>
        <div className="flex flex-wrap gap-3">
          {removableStates.info && (
            <Badge
              variant="info"
              removable
              onRemove={() => handleRemove('info')}
            >
              Dismissible Info
            </Badge>
          )}
          {removableStates.warning && (
            <Badge
              variant="warning"
              icon={AlertCircle}
              removable
              onRemove={() => handleRemove('warning')}
            >
              Warning with Icon
            </Badge>
          )}
          {removableStates.success && (
            <Badge
              size="md"
              variant="success"
              icon={CheckCircle}
              removable
              onRemove={() => handleRemove('success')}
            >
              Completed Task
            </Badge>
          )}
        </div>
      </section>

      {/* Combined - Complex Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Complex Examples</h2>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" size="xs">
              v2.1.0
            </Badge>
            <Badge variant="success" size="xs" icon={CheckCircle}>
              Active
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary" icon={Zap}>
              New Feature
            </Badge>
            <Badge variant="danger" icon={Trash2}>
              Beta
            </Badge>
          </div>
        </div>
      </section>

      {/* Color Combinations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">All Combinations</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {(['xs', 'sm', 'md'] as const).map(size => (
            <div key={size} className="space-y-2">
              <p className="text-sm text-text-secondary">Size: {size}</p>
              <div className="space-y-2">
                <Badge size={size} variant="primary">
                  Primary
                </Badge>
                <Badge size={size} variant="secondary">
                  Secondary
                </Badge>
                <Badge size={size} variant="danger">
                  Danger
                </Badge>
                <Badge size={size} variant="success">
                  Success
                </Badge>
                <Badge size={size} variant="info">
                  Info
                </Badge>
                <Badge size={size} variant="warning">
                  Warning
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
