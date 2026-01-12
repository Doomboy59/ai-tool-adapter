/**
 * OpenAI Function Calling Adapter
 *
 * Converts UniversalTool to OpenAI's function calling format.
 * Output structure wraps the function definition in a type object.
 *
 * @see https://platform.openai.com/docs/guides/function-calling
 */

import type { ToolParam, UniversalTool } from '../types';

interface OpenAIProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: { type: string };
}

interface OpenAIParameters {
  type: 'object';
  properties: Record<string, OpenAIProperty>;
  required: string[];
}

interface OpenAIFunction {
  name: string;
  description: string;
  parameters: OpenAIParameters;
}

interface OpenAITool {
  type: 'function';
  function: OpenAIFunction;
}

/**
 * Convert a single parameter to OpenAI property format
 */
function convertParam(param: ToolParam): OpenAIProperty {
  const property: OpenAIProperty = {
    type: param.type,
  };

  if (param.description) {
    property.description = param.description;
  }

  if (param.enum) {
    property.enum = param.enum;
  }

  if (param.default !== undefined) {
    property.default = param.default;
  }

  if (param.type === 'array' && param.items) {
    property.items = { type: param.items.type };
  }

  return property;
}

/**
 * Converts a UniversalTool to OpenAI function calling format
 *
 * @param tool - Universal tool definition
 * @returns OpenAI-formatted tool object
 */
export function openaiAdapter(tool: UniversalTool): OpenAITool {
  const properties: Record<string, OpenAIProperty> = {};
  const required: string[] = [];

  for (const [paramName, paramDef] of Object.entries(tool.params)) {
    properties[paramName] = convertParam(paramDef);

    if (paramDef.required) {
      required.push(paramName);
    }
  }

  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties,
        required,
      },
    },
  };
}
