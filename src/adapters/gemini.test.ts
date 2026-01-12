/**
 * Tests for Google Gemini adapter
 */

import { describe, it, expect } from 'vitest';
import { geminiAdapter } from './gemini';
import { UniversalTool } from '../types';

describe('geminiAdapter', () => {
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

    const result = geminiAdapter(tool);

    expect(result).toEqual({
      name: 'get_weather',
      description: 'Get current weather for a location',
      parameters: {
        type: 'OBJECT',
        properties: {
          location: {
            type: 'STRING',
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

    const result = geminiAdapter(tool);

    expect(result.parameters.properties.unit).toEqual({
      type: 'STRING',
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

    const result = geminiAdapter(tool);

    expect(result.parameters.properties.items).toEqual({
      type: 'ARRAY',
      description: 'List of items',
      items: { type: 'STRING' },
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

    const result = geminiAdapter(tool);

    expect(result.parameters.properties.page).toEqual({
      type: 'NUMBER',
      default: 1,
    });
    expect(result.parameters.properties.limit).toEqual({
      type: 'NUMBER',
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

    const result = geminiAdapter(tool);

    expect(result.parameters.required).toEqual(['query']);
    expect(result.parameters.properties).toHaveProperty('query');
    expect(result.parameters.properties).toHaveProperty('limit');
    expect(result.parameters.properties).toHaveProperty('exact');
  });

  it('should handle empty params', () => {
    const tool: UniversalTool = {
      name: 'get_status',
      description: 'Get current status',
      params: {},
    };

    const result = geminiAdapter(tool);

    expect(result.parameters).toEqual({
      type: 'OBJECT',
      properties: {},
      required: [],
    });
  });

  it('should use UPPERCASE type names', () => {
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

    const result = geminiAdapter(tool);
    const props = result.parameters.properties;

    expect(props.str.type).toBe('STRING');
    expect(props.num.type).toBe('NUMBER');
    expect(props.bool.type).toBe('BOOLEAN');
    expect(props.arr.type).toBe('ARRAY');
    expect(props.obj.type).toBe('OBJECT');
  });

  it('should use UPPERCASE for array item types', () => {
    const tool: UniversalTool = {
      name: 'test_array',
      description: 'Test array types',
      params: {
        strings: { type: 'array', items: { type: 'string' } },
        numbers: { type: 'array', items: { type: 'number' } },
        bools: { type: 'array', items: { type: 'boolean' } },
      },
    };

    const result = geminiAdapter(tool);
    const props = result.parameters.properties;

    expect(props.strings.items?.type).toBe('STRING');
    expect(props.numbers.items?.type).toBe('NUMBER');
    expect(props.bools.items?.type).toBe('BOOLEAN');
  });

  it('should use flat structure with parameters', () => {
    const tool: UniversalTool = {
      name: 'test',
      description: 'Test tool',
      params: {},
    };

    const result = geminiAdapter(tool);

    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('parameters');
    expect(result).not.toHaveProperty('type');
    expect(result).not.toHaveProperty('function');
  });
});
