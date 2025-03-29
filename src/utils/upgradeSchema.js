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
    cost: { type: 'string' },
    costFactor: { type: 'string' },
    type: {
      type: 'string',
      enum: [
        // click upgrades
        'click', 
        'click_multiplier', 
        'click_automation',  
        'click_critical', 
        'click_critical_multiplier', 
        // rate upgrades
        'rate', 
        'rate_multiplier',
        // autobuyers //TODO: implement autobuyers
        'click_autobuy', 
        'rate_autobuy'
      ] 
    },
    value: { type: 'string' },
    maxLevel: { type: 'number', default: Infinity }
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