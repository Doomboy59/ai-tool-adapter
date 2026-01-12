/**
 * Universal AI Tool Schema Adapter - Type Definitions
 *
 * This is the Single Source of Truth for the data contract.
 * All adapters import from here to ensure consistency.
 */

/**
 * Supported parameter types in the universal schema
 */
export type ParamType = 'string' | 'number' | 'boolean' | 'array' | 'object';

/**
 * Parameter definition in the universal tool schema
 */
export interface ToolParam {
  /** The type of this parameter */
  type: ParamType;

  /** Human-readable description of what this parameter does */
  description?: string;

  /** Whether this parameter is required (default: false) */
  required?: boolean;

  /** Default value for this parameter */
  default?: unknown;

  /** Allowed values for this parameter (for enum-like behavior) */
  enum?: string[];

  /** For array types, defines the type of array items */
  items?: {
    type: ParamType;
  };

  /** For object types, defines nested properties */
  properties?: Record<string, ToolParam>;
}

/**
 * Universal tool definition that can be converted to any provider format
 *
 * This is the core data contract. Changes to this interface require
 * a MAJOR version bump per semantic versioning rules.
 */
export interface UniversalTool {
  /** Function/tool name - must be valid identifier */
  name: string;

  /** Human-readable description of what this tool does */
  description: string;

  /** Parameter definitions for this tool */
  params: Record<string, ToolParam>;
}

/**
 * Supported AI provider platforms
 *
 * Adding new providers requires:
 * 1. Adding the provider name to this union type
 * 2. Creating a new adapter in src/adapters/
 * 3. Registering the adapter in src/index.ts
 * 4. Adding test coverage
 */
export type Provider = 'openai' | 'anthropic' | 'gemini' | 'mistral';
