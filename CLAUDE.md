# CLAUDE.md

## Project Overview

`ai-tool-adapter` — Universal AI tool schema adapter. Write tool definitions once, convert to any LLM provider format.

**Core Problem:** Each AI provider (OpenAI, Anthropic, Google, Mistral) uses different JSON schemas for function/tool calling. This library eliminates duplication and provider lock-in.

---

## Architecture

### Design Pattern: Strategy + Factory

```
┌─────────────────┐      ┌─────────────────────────────────────┐
│  UniversalTool  │      │            Adapters                 │
│    (Contract)   │─────▶│  ┌─────────┐ ┌─────────┐ ┌───────┐ │
└─────────────────┘      │  │ OpenAI  │ │Anthropic│ │Gemini │ │
                         │  └─────────┘ └─────────┘ └───────┘ │
                         └─────────────────────────────────────┘
                                         │
                                         ▼
                              Provider-specific format
```

**Why this pattern:**
- **Strategy Pattern**: Each adapter encapsulates a conversion algorithm. Adapters are interchangeable. Adding providers doesn't modify existing code.
- **Open/Closed Principle**: Open for extension (new adapters), closed for modification.
- **Single Responsibility**: Each adapter handles exactly one provider's format.

### Key Architectural Decision Records (ADRs)

| Decision | Choice | Trade-off |
|----------|--------|-----------|
| Zero dependencies | Yes | Smaller bundle, no supply chain risk, but manual implementation |
| Pure functions | Yes | Testable, predictable, no side effects |
| Runtime type checking | No (current) | Fast but unsafe — consider adding validation |
| Provider as string literal | Yes | Simple API, but typos fail at runtime |

---

## Project Structure

```
src/
├── index.ts              # Public API surface (keep minimal)
├── types.ts              # Data contracts
└── adapters/             # Strategy implementations
    ├── openai.ts
    ├── anthropic.ts
    ├── gemini.ts
    └── mistral.ts
```

**Orthogonality:** Each adapter is independent. Changing one never affects others.

---

## Data Contract: UniversalTool

This is the **schema contract** between consumers and this library. Treat changes carefully.

```typescript
interface UniversalTool {
  name: string;                           // Required: function name
  description: string;                    // Required: what it does
  params: Record<string, ToolParam>;      // Required: parameter definitions
}

interface ToolParam {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required?: boolean;
  default?: unknown;
  enum?: string[];
  items?: { type: ParamType };            // For array types
}
```

### Contract Rules (Design by Contract)

**Preconditions** (caller must ensure):
- `name` is non-empty string, valid identifier (no spaces, special chars)
- `description` is non-empty
- `params` values have valid `type`

**Postconditions** (library guarantees):
- Output matches target provider's expected schema
- All required fields populated
- No undefined/null leakage

**Invariants:**
- Pure transformation: same input → same output (referential transparency)
- No mutation of input object

---

## Public API

Keep the API surface minimal. Every export is a maintenance commitment.

```typescript
// Primary API
adapt(tool: UniversalTool, provider: Provider): unknown
adaptAll(tools: UniversalTool[], provider: Provider): unknown[]

// Discovery
getProviders(): Provider[]

// Types (for TypeScript consumers)
export type { UniversalTool, ToolParam, Provider, ParamType }
```

---

## Provider Output Matrix

| Provider | Wrapper Structure | Schema Key | Type Casing | Notes |
|----------|-------------------|------------|-------------|-------|
| `openai` | `{ type: 'function', function: {...} }` | `parameters` | lowercase | Azure uses same format |
| `anthropic` | flat | `input_schema` | lowercase | Claude API |
| `gemini` | flat | `parameters` | UPPERCASE | Google quirk |
| `mistral` | `{ type: 'function', function: {...} }` | `parameters` | lowercase | OpenAI-compatible |

---

## Adding New Provider

Follow the **Open/Closed Principle** — extend, don't modify.

### Step 1: Create adapter

```typescript
// src/adapters/newprovider.ts
import { UniversalTool, ToolParam } from '../types';

export function newproviderAdapter(tool: UniversalTool) {
  // Transform to provider's expected format
  // Keep it pure: no side effects, no external calls
}
```

### Step 2: Register adapter

```typescript
// src/index.ts
import { newproviderAdapter } from './adapters/newprovider';

const adapters = {
  // ...existing
  newprovider: newproviderAdapter,
};
```

### Step 3: Update types

```typescript
// src/types.ts
export type Provider = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'newprovider';
```

### Step 4: Add test coverage

```typescript
// Verify output matches provider's actual API expectations
// Use real provider docs as source of truth
```

---

## Error Handling Philosophy

**Fail fast, fail loud.** (Pragmatic Programmer)

```typescript
// Current: throws on unknown provider
if (!adapter) {
  throw new Error(`Unknown provider: ${provider}`);
}

// Future consideration: validate input
function validate(tool: UniversalTool): ValidationError[] {
  const errors = [];
  if (!tool.name?.trim()) errors.push({ field: 'name', message: 'Required' });
  if (!tool.description?.trim()) errors.push({ field: 'description', message: 'Required' });
  // ...
  return errors;
}
```

---

## Schema Evolution & Versioning

### Semantic Versioning Contract

| Change | Version Bump | Example |
|--------|--------------|---------|
| New provider | MINOR | Add `cohere` adapter |
| New optional field in UniversalTool | MINOR | Add `examples?: string[]` |
| Bug fix in adapter output | PATCH | Fix missing `required` array |
| Change UniversalTool structure | MAJOR | Breaking change |
| Remove provider | MAJOR | Breaking change |

### Backward Compatibility

When providers update their API:
1. Check if change is additive (safe) or breaking
2. Support both old and new format if possible
3. Document migration path
4. Consider adapter versioning: `adapt(tool, 'openai', { version: '2024-01' })`

---

## Testing Strategy

### Unit Tests (per adapter)

```typescript
describe('openaiAdapter', () => {
  it('wraps in function object', () => { /* ... */ });
  it('maps required params correctly', () => { /* ... */ });
  it('handles enum values', () => { /* ... */ });
  it('handles array types', () => { /* ... */ });
});
```

### Contract Tests

Verify output matches what providers actually accept:

```typescript
// Golden file tests: snapshot of expected output
// Update snapshots only when intentionally changing format
```

### Property-Based Testing (future)

```typescript
// For any valid UniversalTool:
// - adapt() never throws
// - output has required provider fields
// - adapt(tool, p1) !== adapt(tool, p2) for p1 !== p2 (unless formats match)
```

---

## Commands

```bash
npm install                    # Install dependencies
npm run build                  # Compile TypeScript → dist/
npm test                       # Run test suite
npx ts-node test.ts            # Quick manual verification

# Publishing
npm version patch|minor|major  # Bump version (follows semver)
npm run build                  # Must build before publish
npm publish --access public    # Publish to npm
```

---

## Code Principles

1. **DRY (Don't Repeat Yourself):** Universal format exists so users don't repeat tool definitions per provider.

2. **Orthogonality:** Adapters are independent. Tests are independent. No hidden coupling.

3. **Single Source of Truth:** `types.ts` defines the contract. All adapters import from there.

4. **Tracer Bullet Development:** Start with working end-to-end flow, then refine.

5. **No Magic:** Explicit over implicit. Anyone reading the code should understand the transformation.

6. **Composition Over Inheritance:** Adapters are functions, not classes. No inheritance hierarchies.

---

## Future Considerations

| Feature | Effort | Value | Priority |
|---------|--------|-------|----------|
| Input validation with detailed errors | Low | High | P1 |
| TypeScript generics for type-safe output | Medium | Medium | P2 |
| Reverse adapters (provider → universal) | Medium | High | P2 |
| CLI tool for quick conversions | Low | Low | P3 |
| JSON Schema validation | Medium | Medium | P3 |
| Provider version support | High | Medium | P3 |

---

## When Making Changes

1. **Ask:** Does this change break the contract?
2. **Check:** Does this affect other adapters? (It shouldn't)
3. **Test:** Verify all providers still produce valid output
4. **Document:** Update this file if architecture changes
5. **Version:** Bump appropriately per semver rules above