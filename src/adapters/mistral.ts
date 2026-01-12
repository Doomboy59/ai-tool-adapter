/**
 * Mistral AI Function Calling Adapter
 *
 * Converts UniversalTool to Mistral's function calling format.
 * Mistral uses the same format as OpenAI (OpenAI-compatible).
 *
 * @see https://docs.mistral.ai/capabilities/function_calling/
 */

import type { ToolParam, UniversalTool } from '../types';

interface MistralProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: { type: string };
}

interface MistralParameters {
  type: 'object';
  properties: Record<string, MistralProperty>;
  required: string[];
}

interface MistralFunction {
  name: string;
  description: string;
  parameters: MistralParameters;
}

interface MistralTool {
  type: 'function';
  function: MistralFunction;
}

/**
 * Convert a single parameter to Mistral property format
 */
function convertParam(param: ToolParam): MistralProperty {
  const property: MistralProperty = {
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
 * Converts a UniversalTool to Mistral function calling format
 *
 * @param tool - Universal tool definition
 * @returns Mistral-formatted tool object
 */
export function mistralAdapter(tool: UniversalTool): MistralTool {
  const properties: Record<string, MistralProperty> = {};
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
