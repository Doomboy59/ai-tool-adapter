# Git Hooks Setup

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks and enforce commit message standards with [Commitizen](http://commitizen.github.io/cz-cli/).

## How It Works

When you try to use `git commit`, the `prepare-commit-msg` hook will intercept and remind you to use Commitizen instead.

## Committing Changes

Instead of `git commit`, use one of these commands:

```bash
# Using git-cz directly
git cz

# Or using the npm script
npm run commit
```

This will launch an interactive prompt that guides you through creating a properly formatted commit message following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Commit Message Format

The commit messages follow this pattern:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependencies, tooling

### Examples

```
feat(adapters): add support for Cohere provider

Implemented CohereLLM adapter with full tool support.
Added comprehensive test coverage.

Closes #123
```

```
fix(openai): correct required parameters array generation

Previously, parameters with required:false were included.
Now only explicitly required params are added to the array.
```

## Bypassing the Hook (Not Recommended)

If you absolutely need to bypass the hook (e.g., for merge commits):

```bash
git commit --no-verify -m "message"
```

**Note:** This is discouraged as it breaks commit message consistency.

## Benefits

✅ Consistent commit message format across all contributors
✅ Easier to generate changelogs automatically
✅ Better Git history readability
✅ Semantic versioning support
✅ Clear communication of changes
