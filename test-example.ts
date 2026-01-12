/**
 * Example usage script to verify the library works end-to-end
 * Run with: npx ts-node test-example.ts
 */

import { adapt, adaptAll, getProviders } from './src/index';

// Define a sample tool
const weatherTool = {
  name: 'get_weather',
  description: 'Get current weather for a location',
  params: {
    location: {
      type: 'string' as const,
      description: 'City name',
      required: true,
    },
    units: {
      type: 'string' as const,
      description: 'Temperature units',
      enum: ['celsius', 'fahrenheit'],
    },
  },
};

console.log('=== AI Tool Adapter Demo ===\n');

// Show supported providers
console.log('Supported providers:', getProviders());
console.log();

// Convert to OpenAI format
console.log('OpenAI format:');
console.log(JSON.stringify(adapt(weatherTool, 'openai'), null, 2));
console.log();

// Convert to Anthropic format
console.log('Anthropic format:');
console.log(JSON.stringify(adapt(weatherTool, 'anthropic'), null, 2));
console.log();

// Convert to Gemini format (note UPPERCASE types)
console.log('Gemini format:');
console.log(JSON.stringify(adapt(weatherTool, 'gemini'), null, 2));
console.log();

// Convert to Mistral format
console.log('Mistral format:');
console.log(JSON.stringify(adapt(weatherTool, 'mistral'), null, 2));
console.log();

// Test adaptAll
const tools = [
  weatherTool,
  {
    name: 'calculate',
    description: 'Perform arithmetic',
    params: {
      a: { type: 'number' as const, required: true },
      b: { type: 'number' as const, required: true },
    },
  },
];

console.log('Converting multiple tools to OpenAI format:');
const openaiTools = adaptAll(tools, 'openai');
console.log(`Converted ${openaiTools.length} tools successfully`);
console.log();

console.log('✅ All examples completed successfully!');
