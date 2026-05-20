  import { create } from 'zustand';

const useToastStore = create((set) => {
  let toastId = 0;

  return {
    toasts: [],
    addToast: (message, type = 'success', duration = 3000) => {
      const id = toastId++;
      const toast = { id, message, type };

      set((state) => ({
        toasts: [...state.toasts, toast],
      }));

      if (duration > 0) {
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, duration);
      }

      return id;
    },
    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },
    clearAllToasts: () => {
      set({ toasts: [] });
    },
  };
});

export default useToastStore;
