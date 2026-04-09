'use client';

import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AlertCircle size={40} className="text-red-500" />
      </div>
      
      <h2 className="text-3xl font-outfit font-bold text-white mb-3">Qualcosa è andato storto</h2>
      <p className="text-text-secondary max-w-md mb-8 font-inter">
        Si è verificato un errore inaspettato. Abbiamo notificato il team tecnico. Puoi provare a ricaricare la pagina o tornare alla Dashboard.
      </p>
      
      {process.env.NODE_ENV === 'development' && !!error && (
        <pre className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-left text-xs text-red-400 mb-8 max-w-2xl overflow-auto font-mono">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={resetErrorBoundary}
          className="btn-primary py-3 px-8 flex items-center gap-2 group"
        >
          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          Riprova subito
        </button>
        
        <button
          onClick={() => {
            resetErrorBoundary();
            router.push('/');
          }}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 px-8 rounded-2xl transition-all flex items-center gap-2 font-inter font-medium"
        >
          <Home size={18} />
          Torna alla Home
        </button>
      </div>
    </div>
  );
}

export default function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Opzionale: logga il reset dell'errore
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
