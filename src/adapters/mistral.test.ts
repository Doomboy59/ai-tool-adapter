/**
 * Tests for Mistral AI adapter
 */

import { describe, expect, it } from 'vitest';
import type { UniversalTool } from '../types';
import { mistralAdapter } from './mistral';

describe('mistralAdapter', () => {
  it('should convert a basic tool with required params', () => {
    const tool: UniversalTool = {
      name: 'get_weather',
      description: 'Get current weather for a location',
      params: {
        location: {
          type: 'string',
          description: 'City name',
          required: true,
        },
      },
    };

    const result = mistralAdapter(tool);

    expect(result).toEqual({
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get current weather for a location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City name',
            },
          },
          required: ['location'],
        },
      },
    });
  });

  it('should handle enum values', () => {
    const tool: UniversalTool = {
      name: 'set_temperature',
      description: 'Set temperature unit',
      params: {
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit', 'kelvin'],
          required: true,
        },
      },
    };

    const result = mistralAdapter(tool);

    expect(result.function.parameters.properties.unit).toEqual({
      type: 'string',
      enum: ['celsius', 'fahrenheit', 'kelvin'],
    });
  });

  it('should handle array types with items', () => {
    const tool: UniversalTool = {
      name: 'process_items',
      description: 'Process a list of items',
      params: {
        items: {
          type: 'array',
          description: 'List of items',
          items: { type: 'string' },
          required: true,
        },
      },
    };

    const result = mistralAdapter(tool);

    expect(result.function.parameters.properties.items).toEqual({
      type: 'array',
      description: 'List of items',
      items: { type: 'string' },
    });
  });

  it('should handle default values', () => {
    const tool: UniversalTool = {
      name: 'paginate',
      description: 'Get paginated results',
      params: {
        page: {
          type: 'number',
          default: 1,
        },
        limit: {
          type: 'number',
          default: 10,
        },
      },
    };

    const result = mistralAdapter(tool);

    expect(result.function.parameters.properties.page).toEqual({
      type: 'number',
      default: 1,
    });
    expect(result.function.parameters.properties.limit).toEqual({
      type: 'number',
      default: 10,
    });
  });

  it('should handle mixed required and optional params', () => {
    const tool: UniversalTool = {
      name: 'search',
      description: 'Search for items',
      params: {
        query: {
          type: 'string',
          description: 'Search query',
          required: true,
        },
        limit: {
          type: 'number',
          description: 'Result limit',
          default: 10,
        },
        exact: {
          type: 'boolean',
          description: 'Exact match',
        },
      },
    };

    const result = mistralAdapter(tool);

    expect(result.function.parameters.required).toEqual(['query']);
    expect(result.function.parameters.properties).toHaveProperty('query');
    expect(result.function.parameters.properties).toHaveProperty('limit');
    expect(result.function.parameters.properties).toHaveProperty('exact');
  });

  it('should handle empty params', () => {
    const tool: UniversalTool = {
      name: 'get_status',
      description: 'Get current status',
      params: {},
    };

    const result = mistralAdapter(tool);

    expect(result.function.parameters).toEqual({
      type: 'object',
      properties: {},
      required: [],
    });
  });

  it('should use lowercase type names', () => {
    const tool: UniversalTool = {
      name: 'test_types',
      description: 'Test all types',
      params: {
        str: { type: 'string' },
        num: { type: 'number' },
        bool: { type: 'boolean' },
        arr: { type: 'array', items: { type: 'string' } },
        obj: { type: 'object' },
      },
    };

    const result = mistralAdapter(tool);
    const props = result.function.parameters.properties;

    expect(props.str.type).toBe('string');
    expect(props.num.type).toBe('number');
    expect(props.bool.type).toBe('boolean');
    expect(props.arr.type).toBe('array');
    expect(props.obj.type).toBe('object');
  });

  it('should wrap in function object (OpenAI-compatible)', () => {
    const tool: UniversalTool = {
      name: 'test',
      description: 'Test tool',
      params: {},
    };

    const result = mistralAdapter(tool);

    expect(result).toHaveProperty('type', 'function');
    expect(result).toHaveProperty('function');
    expect(result.function).toHaveProperty('name');
    expect(result.function).toHaveProperty('description');
    expect(result.function).toHaveProperty('parameters');
  });
});
