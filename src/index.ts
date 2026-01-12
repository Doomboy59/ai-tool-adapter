/**
 * Universal AI Tool Schema Adapter
 *
 * Write tool definitions once, convert to any LLM provider format.
 * Eliminates duplication and provider lock-in.
 *
 * @example
 * ```typescript
 * import { adapt } from 'ai-tool-adapter';
 *
 * const tool = {
 *   name: 'get_weather',
 *   description: 'Get current weather for a location',
 *   params: {
 *     location: { type: 'string', required: true },
 *     units: { type: 'string', enum: ['celsius', 'fahrenheit'] }
 *   }
 * };
 *
 * const openaiTool = adapt(tool, 'openai');
 * const anthropicTool = adapt(tool, 'anthropic');
 * ```
 */

import { UniversalTool, Provider } from './types';
import { openaiAdapter } from './adapters/openai';
import { anthropicAdapter } from './adapters/anthropic';
import { geminiAdapter } from './adapters/gemini';
import { mistralAdapter } from './adapters/mistral';

/**
 * Adapter registry mapping provider names to their adapter functions
 */
const adapters: Record<Provider, (tool: UniversalTool) => unknown> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
  mistral: mistralAdapter,
};

/**
 * Convert a universal tool definition to a specific provider's format
 *
 * @param tool - Universal tool definition
 * @param provider - Target AI provider
 * @returns Provider-specific tool format
 * @throws {Error} If provider is not supported
 *
 * @example
 * ```typescript
 * const tool = {
 *   name: 'calculate',
 *   description: 'Perform arithmetic calculation',
 *   params: {
 *     operation: { type: 'string', required: true, enum: ['add', 'subtract'] },
 *     a: { type: 'number', required: true },
 *     b: { type: 'number', required: true }
 *   }
 * };
 *
 * const openaiTool = adapt(tool, 'openai');
 * ```
 */
export function adapt(tool: UniversalTool, provider: Provider): unknown {
  const adapter = adapters[provider];

  if (!adapter) {
    throw new Error(`Unknown provider: ${provider}. Supported providers: ${getProviders().join(', ')}`);
  }

  return adapter(tool);
}

/**
 * Convert multiple universal tool definitions to a specific provider's format
 *
 * @param tools - Array of universal tool definitions
 * @param provider - Target AI provider
 * @returns Array of provider-specific tool formats
 * @throws {Error} If provider is not supported
 *
 * @example
 * ```typescript
 * const tools = [
 *   { name: 'get_weather', description: 'Get weather', params: {...} },
 *   { name: 'get_time', description: 'Get time', params: {...} }
 * ];
 *
 * const openaiTools = adaptAll(tools, 'openai');
 * ```
 */
export function adaptAll(tools: UniversalTool[], provider: Provider): unknown[] {
  return tools.map((tool) => adapt(tool, provider));
}

/**
 * Get list of all supported AI providers
 *
 * @returns Array of supported provider names
 *
 * @example
 * ```typescript
 * const providers = getProviders();
 * console.log(providers); // ['openai', 'anthropic', 'gemini', 'mistral']
 * ```
 */
export function getProviders(): Provider[] {
  return Object.keys(adapters) as Provider[];
}

/**
 * Export types for TypeScript consumers
 */
export type { UniversalTool, ToolParam, Provider, ParamType } from './types';
