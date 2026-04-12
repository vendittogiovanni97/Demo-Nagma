import toast from 'react-hot-toast';

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(error: unknown, fallbackMessage = 'Qualcosa è andato storto') {
  const message = error instanceof Error ? error.message : fallbackMessage;
  toast.error(message);
}
