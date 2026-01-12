/**
 * Integration tests for the public API
 */

import { describe, expect, it } from 'vitest';
import { adapt, adaptAll, getProviders } from './index';
import type { UniversalTool } from './types';

describe('adapt', () => {
  const sampleTool: UniversalTool = {
    name: 'get_weather',
    description: 'Get current weather for a location',
    params: {
      location: {
        type: 'string',
        description: 'City name',
        required: true,
      },
      units: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
      },
    },
  };

  it('should adapt tool to OpenAI format', () => {
    const result = adapt(sampleTool, 'openai');

    expect(result).toHaveProperty('type', 'function');
    expect(result).toHaveProperty('function');
  });

  it('should adapt tool to Anthropic format', () => {
    const result = adapt(sampleTool, 'anthropic');

    expect(result).toHaveProperty('name', 'get_weather');
    expect(result).toHaveProperty('input_schema');
    expect(result).not.toHaveProperty('type');
  });

  it('should adapt tool to Gemini format', () => {
    const result = adapt(sampleTool, 'gemini');

    expect(result).toHaveProperty('name', 'get_weather');
    expect(result).toHaveProperty('parameters');
    expect(result).not.toHaveProperty('type');
  });

  it('should adapt tool to Mistral format', () => {
    const result = adapt(sampleTool, 'mistral');

    expect(result).toHaveProperty('type', 'function');
    expect(result).toHaveProperty('function');
  });

  it('should throw error for unknown provider', () => {
    expect(() => {
      adapt(sampleTool, 'unknown' as any);
    }).toThrow('Unknown provider: unknown');
  });

  it('should include list of supported providers in error message', () => {
    expect(() => {
      adapt(sampleTool, 'invalid' as any);
    }).toThrow(/openai.*anthropic.*gemini.*mistral/);
  });
});

describe('adaptAll', () => {
  const tools: UniversalTool[] = [
    {
      name: 'get_weather',
      description: 'Get weather',
      params: {
        location: { type: 'string', required: true },
      },
    },
    {
      name: 'get_time',
      description: 'Get current time',
      params: {
        timezone: { type: 'string' },
      },
    },
    {
      name: 'calculate',
      description: 'Perform calculation',
      params: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract'],
          required: true,
        },
        a: { type: 'number', required: true },
        b: { type: 'number', required: true },
      },
    },
  ];

  it('should adapt multiple tools to OpenAI format', () => {
    const results = adaptAll(tools, 'openai');

    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result).toHaveProperty('type', 'function');
      expect(result).toHaveProperty('function');
    });
  });

  it('should adapt multiple tools to Anthropic format', () => {
    const results = adaptAll(tools, 'anthropic');

    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('input_schema');
    });
  });

  it('should adapt multiple tools to Gemini format', () => {
    const results = adaptAll(tools, 'gemini');

    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('parameters');
    });
  });

  it('should adapt multiple tools to Mistral format', () => {
    const results = adaptAll(tools, 'mistral');

    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result).toHaveProperty('type', 'function');
      expect(result).toHaveProperty('function');
    });
  });

  it('should handle empty array', () => {
    const results = adaptAll([], 'openai');
    expect(results).toEqual([]);
  });

  it('should throw error for unknown provider', () => {
    expect(() => {
      adaptAll(tools, 'invalid' as any);
    }).toThrow('Unknown provider');
  });
});

describe('getProviders', () => {
  it('should return array of all supported providers', () => {
    const providers = getProviders();

    expect(providers).toBeInstanceOf(Array);
    expect(providers).toHaveLength(4);
  });

  it('should include all four providers', () => {
    const providers = getProviders();

    expect(providers).toContain('openai');
    expect(providers).toContain('anthropic');
    expect(providers).toContain('gemini');
    expect(providers).toContain('mistral');
  });
});

describe('Cross-provider consistency', () => {
  const tool: UniversalTool = {
    name: 'test_tool',
    description: 'A test tool for validation',
    params: {
      required_param: {
        type: 'string',
        description: 'A required parameter',
        required: true,
      },
      optional_param: {
        type: 'number',
        description: 'An optional parameter',
        default: 42,
      },
      enum_param: {
        type: 'string',
        enum: ['option1', 'option2', 'option3'],
      },
      array_param: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  };

  it('should preserve tool name across all providers', () => {
    const openai = adapt(tool, 'openai') as any;
    const anthropic = adapt(tool, 'anthropic') as any;
    const gemini = adapt(tool, 'gemini') as any;
    const mistral = adapt(tool, 'mistral') as any;

    expect(openai.function.name).toBe('test_tool');
    expect(anthropic.name).toBe('test_tool');
    expect(gemini.name).toBe('test_tool');
    expect(mistral.function.name).toBe('test_tool');
  });

  it('should preserve tool description across all providers', () => {
    const openai = adapt(tool, 'openai') as any;
    const anthropic = adapt(tool, 'anthropic') as any;
    const gemini = adapt(tool, 'gemini') as any;
    const mistral = adapt(tool, 'mistral') as any;

    expect(openai.function.description).toBe('A test tool for validation');
    expect(anthropic.description).toBe('A test tool for validation');
    expect(gemini.description).toBe('A test tool for validation');
    expect(mistral.function.description).toBe('A test tool for validation');
  });

  it('should preserve required params across all providers', () => {
    const openai = adapt(tool, 'openai') as any;
    const anthropic = adapt(tool, 'anthropic') as any;
    const gemini = adapt(tool, 'gemini') as any;
    const mistral = adapt(tool, 'mistral') as any;

    expect(openai.function.parameters.required).toContain('required_param');
    expect(anthropic.input_schema.required).toContain('required_param');
    expect(gemini.parameters.required).toContain('required_param');
    expect(mistral.function.parameters.required).toContain('required_param');
  });

  it('should preserve enum values across all providers', () => {
    const openai = adapt(tool, 'openai') as any;
    const anthropic = adapt(tool, 'anthropic') as any;
    const gemini = adapt(tool, 'gemini') as any;
    const mistral = adapt(tool, 'mistral') as any;

    const expectedEnum = ['option1', 'option2', 'option3'];

    expect(openai.function.parameters.properties.enum_param.enum).toEqual(
      expectedEnum
    );
    expect(anthropic.input_schema.properties.enum_param.enum).toEqual(
      expectedEnum
    );
    expect(gemini.parameters.properties.enum_param.enum).toEqual(expectedEnum);
    expect(mistral.function.parameters.properties.enum_param.enum).toEqual(
      expectedEnum
    );
  });

  it('should preserve default values across all providers', () => {
    const openai = adapt(tool, 'openai') as any;
    const anthropic = adapt(tool, 'anthropic') as any;
    const gemini = adapt(tool, 'gemini') as any;
    const mistral = adapt(tool, 'mistral') as any;

    expect(openai.function.parameters.properties.optional_param.default).toBe(
      42
    );
    expect(anthropic.input_schema.properties.optional_param.default).toBe(42);
    expect(gemini.parameters.properties.optional_param.default).toBe(42);
    expect(mistral.function.parameters.properties.optional_param.default).toBe(
      42
    );
  });
});
