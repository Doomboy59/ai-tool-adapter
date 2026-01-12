/**
 * Anthropic (Claude) Tool Adapter
 *
 * Converts UniversalTool to Anthropic's tool format.
 * Output structure is flat with input_schema instead of parameters.
 *
 * @see https://docs.anthropic.com/claude/docs/tool-use
 */

import type { ToolParam, UniversalTool } from '../types';

interface AnthropicProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: { type: string };
}

interface AnthropicInputSchema {
  type: 'object';
  properties: Record<string, AnthropicProperty>;
  required: string[];
}

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: AnthropicInputSchema;
}

/**
 * Convert a single parameter to Anthropic property format
 */
function convertParam(param: ToolParam): AnthropicProperty {
  const property: AnthropicProperty = {
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
 * Converts a UniversalTool to Anthropic tool format
 *
 * @param tool - Universal tool definition
 * @returns Anthropic-formatted tool object
 */
export function anthropicAdapter(tool: UniversalTool): AnthropicTool {
  const properties: Record<string, AnthropicProperty> = {};
  const required: string[] = [];

  for (const [paramName, paramDef] of Object.entries(tool.params)) {
    properties[paramName] = convertParam(paramDef);

    if (paramDef.required) {
      required.push(paramName);
    }
  }

  return {
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: 'object',
      properties,
      required,
    },
  };
}
