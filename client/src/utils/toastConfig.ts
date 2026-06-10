import toast from 'react-hot-toast';

const DEFAULT_OPTIONS = {
  duration: 1800,
  position: 'top-center' as const,
};

export function notifySuccess(message: string) {
  toast.success(message, DEFAULT_OPTIONS);
}

export function notifyError(message: string) {
  toast.error(message, { ...DEFAULT_OPTIONS, duration: 2500 });
}

export function notifyInfo(message: string) {
  toast(message, { ...DEFAULT_OPTIONS, icon: 'ℹ️' });
}
