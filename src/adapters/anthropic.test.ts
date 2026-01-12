/**
 * Tests for Anthropic (Claude) adapter
 */

import { describe, expect, it } from 'vitest';
import type { UniversalTool } from '../types';
import { anthropicAdapter } from './anthropic';

describe('anthropicAdapter', () => {
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

    const result = anthropicAdapter(tool);

    expect(result).toEqual({
      name: 'get_weather',
      description: 'Get current weather for a location',
      input_schema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'City name',
          },
        },
        required: ['location'],
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

    const result = anthropicAdapter(tool);

    expect(result.input_schema.properties.unit).toEqual({
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

    const result = anthropicAdapter(tool);

    expect(result.input_schema.properties.items).toEqual({
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

    const result = anthropicAdapter(tool);

    expect(result.input_schema.properties.page).toEqual({
      type: 'number',
      default: 1,
    });
    expect(result.input_schema.properties.limit).toEqual({
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

    const result = anthropicAdapter(tool);

    expect(result.input_schema.required).toEqual(['query']);
    expect(result.input_schema.properties).toHaveProperty('query');
    expect(result.input_schema.properties).toHaveProperty('limit');
    expect(result.input_schema.properties).toHaveProperty('exact');
  });

  it('should handle empty params', () => {
    const tool: UniversalTool = {
      name: 'get_status',
      description: 'Get current status',
      params: {},
    };

    const result = anthropicAdapter(tool);

    expect(result.input_schema).toEqual({
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

    const result = anthropicAdapter(tool);
    const props = result.input_schema.properties;

    expect(props.str.type).toBe('string');
    expect(props.num.type).toBe('number');
    expect(props.bool.type).toBe('boolean');
    expect(props.arr.type).toBe('array');
    expect(props.obj.type).toBe('object');
  });

  it('should use flat structure with input_schema', () => {
    const tool: UniversalTool = {
      name: 'test',
      description: 'Test tool',
      params: {},
    };

    const result = anthropicAdapter(tool);

    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('input_schema');
    expect(result).not.toHaveProperty('type');
    expect(result).not.toHaveProperty('function');
  });
});
