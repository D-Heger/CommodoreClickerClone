import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmationDialog from './ConfirmationDialog.vue';

describe('ConfirmationDialog.vue', () => {
  const factory = (props = {}) => {
    return mount(ConfirmationDialog, {
      props: {
        show: true, // Correct prop name is 'show'
        message: 'Are you sure you want to proceed?',
        confirmText: 'Yes, Proceed',
        cancelText: 'No, Cancel',
        ...props,
      },
    });
  };

  it('renders correctly when show is true', () => {
    const wrapper = factory();
    expect(wrapper.find('.overlay').exists()).toBe(true); // Use correct class
    expect(wrapper.find('.confirmation-dialog').exists()).toBe(true);
  });

  it('does not render when show is false', () => {
    const wrapper = factory({ show: false }); // Use 'show' prop
    // Check if the root element is not rendered
    // Using find().exists() is generally better than checking classes like 'hidden'
    expect(wrapper.find('.overlay').exists()).toBe(false); // Use correct class
  });

  it('displays the correct message from props', () => {
    const message = 'This is a custom confirmation message.';
    const wrapper = factory({ message: message });
    expect(wrapper.find('h3').text()).toBe(message); // Message is in h3
  });

  // Remove tests for confirmText/cancelText props as they don't exist

  it('displays hardcoded button text', () => {
    const wrapper = factory();
    // Check against the hardcoded text in the component template
    expect(wrapper.find('button.retro-button.danger .action-text').text()).toBe('CONFIRM');
    expect(wrapper.find('button.retro-button:not(.danger) .action-text').text()).toBe('CANCEL');
  });


  it('emits "confirm" event when the confirm button is clicked', async () => {
    const wrapper = factory();
    await wrapper.find('button.retro-button.danger').trigger('click'); // Use correct selector

    expect(wrapper.emitted()).toHaveProperty('confirm');
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('emits "cancel" event when the cancel button is clicked', async () => {
    const wrapper = factory();
    // Find the button that is NOT the danger button
    await wrapper.find('button.retro-button:not(.danger)').trigger('click'); // Use correct selector

    expect(wrapper.emitted()).toHaveProperty('cancel');
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  // Removed test for default prop text as props don't exist

});