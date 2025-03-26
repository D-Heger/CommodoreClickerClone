import Ajv from 'ajv';

// Create Ajv instance
const ajv = new Ajv();

export const upgradeSchema = {
  type: 'object',
  required: ['name', 'description', 'cost', 'costFactor', 'type', 'value'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    cost: { type: 'string' }, // Using string for precision with Decimal.js
    costFactor: { type: 'string' }, // Cost multiplier for each purchase
    type: { type: 'string', enum: ['click', 'click_multiplier', 'click_automation', 'click_autobuy', 'click_critical', 'click_critical_multiplier', 'rate', 'rate_multiplier', 'rate_autobuy'] },
    value: { type: 'string' }, // Using string for precision with Decimal.js
    maxLevel: { type: 'number', default: Infinity } // Optional max level
  }
}

// Compile the schema
const validateSchema = ajv.compile(upgradeSchema);

// Helper function to validate an upgrade against the schema
export function validateUpgrade(upgrade) {
  const isValid = validateSchema(upgrade);
  
  if (!isValid) {
    console.error('Invalid upgrade:', validateSchema.errors);
    return false;
  }
  
  return true;
}