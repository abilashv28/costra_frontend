import useToastStore from '../stores/toastStore';

/**
 * Show a success toast message
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showSuccessToast = (message, duration = 3000) => {
  const addToast = useToastStore.getState().addToast;
  return addToast(message, 'success', duration);
};

/**
 * Show an error toast message
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showErrorToast = (message, duration = 3000) => {
  const addToast = useToastStore.getState().addToast;
  return addToast(message, 'error', duration);
};

/**
 * Show an info toast message
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showInfoToast = (message, duration = 3000) => {
  const addToast = useToastStore.getState().addToast;
  return addToast(message, 'info', duration);
};

/**
 * Show a warning toast message
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showWarningToast = (message, duration = 3000) => {
  const addToast = useToastStore.getState().addToast;
  return addToast(message, 'warning', duration);
};
