# ai-tool-adapter

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Universal AI tool schema adapter for function calling across multiple LLM providers.

Write your tool definitions once, convert to any provider format instantly. No more duplicating schemas for OpenAI, Anthropic, Google, and Mistral.

## Features

- **Zero dependencies** - Lightweight and secure
- **Type-safe** - Full TypeScript support with strict typing
- **Provider-agnostic** - One schema, multiple formats
- **Pure functions** - Predictable transformations with no side effects
- **Well-tested** - Comprehensive test coverage across all adapters

## Supported Providers

- **OpenAI** - GPT-4, GPT-3.5 function calling
- **Anthropic** - Claude tool use
- **Google Gemini** - Gemini function calling
- **Mistral** - Mistral AI function calling

## Installation

```bash
npm install ai-tool-adapter
```

## Quick Start

```typescript
import { adapt } from 'ai-tool-adapter';

// Define your tool once using the universal schema
const weatherTool = {
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
      description: 'Temperature units',
      enum: ['celsius', 'fahrenheit'],
    },
  },
};

// Convert to any provider format
const openaiTool = adapt(weatherTool, 'openai');
const anthropicTool = adapt(weatherTool, 'anthropic');
const geminiTool = adapt(weatherTool, 'gemini');
const mistralTool = adapt(weatherTool, 'mistral');
```

## API Reference

### `adapt(tool, provider)`

Convert a single universal tool definition to a specific provider's format.

**Parameters:**
- `tool` (UniversalTool) - Your universal tool definition
- `provider` (Provider) - Target provider: `'openai'` | `'anthropic'` | `'gemini'` | `'mistral'`

**Returns:** Provider-specific tool format

**Throws:** Error if provider is not supported

```typescript
const tool = {
  name: 'calculate',
  description: 'Perform arithmetic calculation',
  params: {
    operation: {
      type: 'string',
      enum: ['add', 'subtract', 'multiply', 'divide'],
      required: true,
    },
    a: { type: 'number', required: true },
    b: { type: 'number', required: true },
  },
};

const openaiTool = adapt(tool, 'openai');
```

### `adaptAll(tools, provider)`

Convert multiple tools at once.

**Parameters:**
- `tools` (UniversalTool[]) - Array of universal tool definitions
- `provider` (Provider) - Target provider

**Returns:** Array of provider-specific tool formats

```typescript
const tools = [weatherTool, calculatorTool, searchTool];
const openaiTools = adaptAll(tools, 'openai');
```

### `getProviders()`

Get list of all supported providers.

**Returns:** Array of provider names

```typescript
const providers = getProviders();
console.log(providers); // ['openai', 'anthropic', 'gemini', 'mistral']
```

## Universal Tool Schema

### Basic Structure

```typescript
interface UniversalTool {
  name: string;           // Function name
  description: string;    // What the tool does
  params: Record<string, ToolParam>;  // Parameter definitions
}
```

### Parameter Definition

```typescript
interface ToolParam {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;   // Parameter description
  required?: boolean;     // Whether required (default: false)
  default?: unknown;      // Default value
  enum?: string[];        // Allowed values
  items?: {               // For array types
    type: ParamType;
  };
}
```

## Examples

### Simple Tool

```typescript
const statusTool = {
  name: 'get_status',
  description: 'Get current system status',
  params: {},  // No parameters
};
```

### Tool with Required Parameters

```typescript
const searchTool = {
  name: 'search',
  description: 'Search for items',
  params: {
    query: {
      type: 'string',
      description: 'Search query',
      required: true,
    },
  },
};
```

### Tool with Enums

```typescript
const sortTool = {
  name: 'sort_results',
  description: 'Sort search results',
  params: {
    order: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'asc',
    },
  },
};
```

### Tool with Array Parameters

```typescript
const batchTool = {
  name: 'process_batch',
  description: 'Process multiple items',
  params: {
    items: {
      type: 'array',
      description: 'Items to process',
      items: { type: 'string' },
      required: true,
    },
  },
};
```

### Complex Tool

```typescript
const apiTool = {
  name: 'api_request',
  description: 'Make an API request',
  params: {
    endpoint: {
      type: 'string',
      description: 'API endpoint path',
      required: true,
    },
    method: {
      type: 'string',
      description: 'HTTP method',
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET',
    },
    headers: {
      type: 'object',
      description: 'Request headers',
    },
    params: {
      type: 'array',
      description: 'Query parameters',
      items: { type: 'string' },
    },
    timeout: {
      type: 'number',
      description: 'Request timeout in milliseconds',
      default: 5000,
    },
  },
};
```

## Provider Output Formats

### OpenAI

Wraps function definition in a type object:

```json
{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "Get weather",
    "parameters": {
      "type": "object",
      "properties": {...},
      "required": [...]
    }
  }
}
```

### Anthropic

Flat structure with `input_schema`:

```json
{
  "name": "get_weather",
  "description": "Get weather",
  "input_schema": {
    "type": "object",
    "properties": {...},
    "required": [...]
  }
}
```

### Gemini

Flat structure with UPPERCASE types:

```json
{
  "name": "get_weather",
  "description": "Get weather",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "location": { "type": "STRING" }
    },
    "required": [...]
  }
}
```

### Mistral

OpenAI-compatible format:

```json
{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "Get weather",
    "parameters": {...}
  }
}
```

## Real-World Usage

### With OpenAI SDK

```typescript
import OpenAI from 'openai';
import { adapt } from 'ai-tool-adapter';

const client = new OpenAI();

const tools = [weatherTool, calculatorTool].map(tool =>
  adapt(tool, 'openai')
);

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'What\'s the weather in Paris?' }],
  tools,
});
```

### With Anthropic SDK

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { adaptAll } from 'ai-tool-adapter';

const client = new Anthropic();

const tools = adaptAll([weatherTool, calculatorTool], 'anthropic');

const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'What\'s the weather in Paris?' }],
  tools,
});
```

### Multi-Provider Support

```typescript
import { adapt } from 'ai-tool-adapter';

// Single source of truth for your tools
const myTools = [weatherTool, calculatorTool, searchTool];

// Support all providers effortlessly
const providerClients = {
  openai: { tools: myTools.map(t => adapt(t, 'openai')) },
  anthropic: { tools: myTools.map(t => adapt(t, 'anthropic')) },
  gemini: { tools: myTools.map(t => adapt(t, 'gemini')) },
  mistral: { tools: myTools.map(t => adapt(t, 'mistral')) },
};

// Use whichever provider you need
function callLLM(provider: string, prompt: string) {
  const config = providerClients[provider];
  // Make API call with provider-specific tools
}
```

## TypeScript Support

Full type definitions included:

```typescript
import type {
  UniversalTool,
  ToolParam,
  Provider,
  ParamType
} from 'ai-tool-adapter';

const tool: UniversalTool = {
  name: 'my_tool',
  description: 'My custom tool',
  params: {
    param1: {
      type: 'string',
      required: true,
    },
  },
};
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode for tests
npm run test:watch

# Commit changes (uses Commitizen for consistent commit messages)
npm run commit
# or
git cz
```

### Commit Messages

This project uses [Commitizen](http://commitizen.github.io/cz-cli/) for standardized commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Instead of `git commit`, use:**
- `git cz` or `npm run commit` - Interactive commit message builder

This ensures all commits follow a consistent format, making it easier to generate changelogs and understand project history.

## Architecture

This library follows the **Strategy Pattern** with each provider adapter as an independent, interchangeable strategy. This design ensures:

- **Orthogonality** - Adapters are completely independent
- **Open/Closed Principle** - Easy to add new providers without modifying existing code
- **Single Responsibility** - Each adapter handles exactly one provider's format
- **Pure Functions** - Predictable, testable transformations

For detailed architecture documentation, see [CLAUDE.md](./CLAUDE.md).

## Contributing

Contributions are welcome! To add a new provider:

1. Create adapter in `src/adapters/yourprovider.ts`
2. Add provider to `Provider` type in `src/types.ts`
3. Register adapter in `src/index.ts`
4. Add comprehensive tests
5. Update documentation

See [CLAUDE.md](./CLAUDE.md) for detailed guidelines.

## License

ISC

## Related

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Anthropic Tool Use](https://docs.anthropic.com/claude/docs/tool-use)
- [Google Gemini Function Calling](https://ai.google.dev/docs/function_calling)
- [Mistral AI Function Calling](https://docs.mistral.ai/capabilities/function_calling/)
