/**
 * Google Gemini Function Calling Adapter
 *
 * Converts UniversalTool to Gemini's function calling format.
 * Key quirk: Type names must be UPPERCASE (STRING, NUMBER, BOOLEAN, ARRAY, OBJECT)
 *
 * @see https://ai.google.dev/docs/function_calling
 */

import type { ToolParam, UniversalTool } from '../types';

interface GeminiProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: { type: string };
}

interface GeminiParameters {
  type: 'OBJECT';
  properties: Record<string, GeminiProperty>;
  required: string[];
}

interface GeminiTool {
  name: string;
  description: string;
  parameters: GeminiParameters;
}

/**
 * Convert lowercase type to uppercase for Gemini
 */
function toGeminiType(type: string): string {
  return type.toUpperCase();
}

/**
 * Convert a single parameter to Gemini property format
 */
function convertParam(param: ToolParam): GeminiProperty {
  const property: GeminiProperty = {
    type: toGeminiType(param.type),
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
    property.items = { type: toGeminiType(param.items.type) };
  }

  return property;
}

/**
 * Converts a UniversalTool to Gemini function calling format
 *
 * @param tool - Universal tool definition
 * @returns Gemini-formatted tool object
 */
export function geminiAdapter(tool: UniversalTool): GeminiTool {
  const properties: Record<string, GeminiProperty> = {};
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
    parameters: {
      type: 'OBJECT',
      properties,
      required,
    },
  };
}
