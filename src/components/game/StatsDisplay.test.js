import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import StatsDisplay from './StatsDisplay.vue';

describe('StatsDisplay.vue', () => {
  // Simple mock props with string values
  const mockProps = {
    pixels: '12345',
    totalPixels: '987654',
    computerSpeed: '150.5',
    clickPower: '25.8',
    clickMultiplier: '1',
    clickCriticalChance: '15',
    clickCritMultiplier: '5',
    autoRate: '0',
    rateMultiplier: '1',
    autoClicks: '2',
    spentPixels: '500000',
    completedFrames: '123',
  };

  const createWrapper = (props = {}) => {
    return mount(StatsDisplay, {
      props: {
        ...mockProps,
        ...props,
      },
    });
  };

  // Test 1: Basic rendering of compact stats
  it('renders the compact stats display', () => {
    const wrapper = createWrapper();
    const compactStats = wrapper.find('.stats.crt-panel');
    
    expect(compactStats.exists()).toBe(true);
    // Check that key stats are displayed (without testing exact formatting)
    expect(compactStats.text()).toContain('PIXELS');
    expect(compactStats.text()).toContain('CLOCK');
    expect(compactStats.text()).toContain('POWER');
  });

  // Test 2: Detailed stats panel is initially hidden
  it('renders the detailed stats panel initially hidden', () => {
    const wrapper = createWrapper();
    const detailedStats = wrapper.find('.detailed-stats.crt-panel');
    
    expect(detailedStats.exists()).toBe(true);
    expect(detailedStats.classes()).not.toContain('open');
  });

  // Test 3: Toggle functionality
  it('toggles the detailed stats panel visibility on button click', async () => {
    const wrapper = createWrapper();
    const toggleButton = wrapper.find('button.stats-toggle-btn');
    const detailedStats = wrapper.find('.detailed-stats.crt-panel');
    
    // Initially closed
    expect(detailedStats.classes()).not.toContain('open');
    expect(toggleButton.text()).toBe('▼');
    
    // Open panel
    await toggleButton.trigger('click');
    expect(detailedStats.classes()).toContain('open');
    expect(toggleButton.text()).toBe('▲');
    
    // Close panel
    await toggleButton.trigger('click');
    expect(detailedStats.classes()).not.toContain('open');
    expect(toggleButton.text()).toBe('▼');
  });

  // Test 4: Detailed stats content
  it('displays stat groups in the detailed panel when open', async () => {
    const wrapper = createWrapper();
    
    // Open the panel
    await wrapper.find('button.stats-toggle-btn').trigger('click');
    const detailedStats = wrapper.find('.detailed-stats.crt-panel');
    
    // Check that all stat groups exist
    const statGroups = detailedStats.findAll('.stat-group');
    expect(statGroups.length).toBeGreaterThanOrEqual(3); // At least 3 groups
    
    // Check group headings
    const headings = detailedStats.findAll('.stat-group h3');
    const headingTexts = headings.map(h => h.text());
    
    expect(headingTexts).toContain('CLICK STATS');
    expect(headingTexts).toContain('PRODUCTION STATS');
    expect(headingTexts).toContain('TOTAL STATS');
    
    // Check that key stats are displayed in each group (without testing exact formatting)
    const clickGroup = detailedStats.find('.stat-group:nth-child(1)');
    expect(clickGroup.text()).toContain('POWER');
    expect(clickGroup.text()).toContain('MULTIPLIER');
    expect(clickGroup.text()).toContain('CRIT CHANCE');
    
    const productionGroup = detailedStats.find('.stat-group:nth-child(2)');
    expect(productionGroup.text()).toContain('CLOCK SPEED');
    expect(productionGroup.text()).toContain('AUTO RATE');
    
    const totalGroup = detailedStats.find('.stat-group:nth-child(3)');
    expect(totalGroup.text()).toContain('PIXELS');
    expect(totalGroup.text()).toContain('SPENT PIXELS');
    expect(totalGroup.text()).toContain('TOTAL PIXELS');
  });
});