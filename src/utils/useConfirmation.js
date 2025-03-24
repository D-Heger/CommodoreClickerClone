import { ref } from 'vue';

/**
 * Provides a reusable confirmation dialog functionality
 * @returns {Object} Confirmation state and methods
 */
export function useConfirmation() {
  const showConfirmation = ref(false);
  const confirmationMessage = ref('');
  const confirmationAction = ref(null);
  
  /**
   * Opens the confirmation dialog
   * @param {string} message - Message to display in the confirmation dialog
   * @param {Function} action - Function to execute when confirmed
   */
  const confirm = (message, action) => {
    confirmationMessage.value = message;
    confirmationAction.value = action;
    showConfirmation.value = true;
  };
  
  /**
   * Handles confirmation action
   */
  const handleConfirm = () => {
    if (confirmationAction.value) {
      confirmationAction.value();
    }
    showConfirmation.value = false;
  };
  
  /**
   * Cancels confirmation dialog
   */
  const cancelConfirmation = () => {
    showConfirmation.value = false;
  };
  
  return {
    showConfirmation,
    confirmationMessage,
    confirm,
    handleConfirm,
    cancelConfirmation
  };
}