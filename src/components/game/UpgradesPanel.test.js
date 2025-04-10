import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UpgradesPanel from './UpgradesPanel.vue';

describe('UpgradesPanel.vue', () => {
  // Simple mock data
  const mockUpgrades = [
    {
      id: 'click-1',
      name: 'Click Power',
      description: 'Increases click power',
      cost: '10',
      costFactor: '1.1',
      valueBase: '1',
      valueFactor: '1',
      maxLevel: '0',
      level: '1',
      type: 'click',
    },
  ];

  // Basic test - just verify the component renders
  it('renders the component with upgrades', () => {
    const wrapper = mount(UpgradesPanel, {
      props: {
        pixels: '100',
        upgrades: mockUpgrades,
      },
    });
    
    // Check that the component renders
    expect(wrapper.find('.upgrades-panel').exists()).toBe(true);
    
    // Check that the title is rendered
    expect(wrapper.find('h2').text()).toBe('UPGRADES');
    
    // Check that at least one upgrade is rendered
    expect(wrapper.find('.upgrade-item').exists()).toBe(true);
  });
});