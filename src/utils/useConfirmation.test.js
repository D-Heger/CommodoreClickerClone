import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConfirmation } from './useConfirmation';
import { isRef, ref } from 'vue'; // Import isRef to check if returned values are refs

describe('useConfirmation Composable', () => {
  let confirmation;
  let mockAction;

  beforeEach(() => {
    // Get a fresh instance of the composable before each test
    confirmation = useConfirmation();
    // Create a mock function for the action
    mockAction = vi.fn();
  });

  it('should return refs for showConfirmation and confirmationMessage', () => {
    expect(isRef(confirmation.showConfirmation)).toBe(true);
    expect(isRef(confirmation.confirmationMessage)).toBe(true);
  });

  it('should initialize with showConfirmation as false and empty message', () => {
    expect(confirmation.showConfirmation.value).toBe(false);
    expect(confirmation.confirmationMessage.value).toBe('');
    // confirmationAction is internal, not directly testable without calling confirm
  });

  describe('confirm', () => {
    it('should set showConfirmation to true', () => {
      confirmation.confirm('Test message', mockAction);
      expect(confirmation.showConfirmation.value).toBe(true);
    });

    it('should set the confirmationMessage', () => {
      const message = 'Are you sure you want to proceed?';
      confirmation.confirm(message, mockAction);
      expect(confirmation.confirmationMessage.value).toBe(message);
    });

    it('should store the provided action function', () => {
      // We test this indirectly via handleConfirm
      confirmation.confirm('Test', mockAction);
      confirmation.handleConfirm();
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleConfirm', () => {
    beforeEach(() => {
      // Setup confirmation before testing handleConfirm
      confirmation.confirm('Confirm this action', mockAction);
    });

    it('should call the stored action function if it exists', () => {
      confirmation.handleConfirm();
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should set showConfirmation to false after executing action', () => {
      confirmation.handleConfirm();
      expect(confirmation.showConfirmation.value).toBe(false);
    });

    it('should not throw error if no action was provided', () => {
       // Reset and call confirm without an action
       confirmation = useConfirmation();
       confirmation.confirm('No action here', null); // Pass null or undefined for action

       expect(() => confirmation.handleConfirm()).not.toThrow();
       expect(confirmation.showConfirmation.value).toBe(false); // Should still hide dialog
    });
  });

  describe('cancelConfirmation', () => {
     beforeEach(() => {
      // Setup confirmation before testing cancelConfirmation
      confirmation.confirm('Cancel this action', mockAction);
    });

    it('should set showConfirmation to false', () => {
      confirmation.cancelConfirmation();
      expect(confirmation.showConfirmation.value).toBe(false);
    });

    it('should not call the stored action function', () => {
      confirmation.cancelConfirmation();
      expect(mockAction).not.toHaveBeenCalled();
    });
  });
});