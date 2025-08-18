# @clash-strategic/release-config

Shared semantic-release configuration for Clash Strategic repositories. This package provides a standardized configuration for automated versioning, changelog generation, and releases across all our projects.

## Features

- 🚀 **Automated versioning** using semantic-release
- 📝 **Automatic changelog generation**
- 🔄 **Configurable file version updates** with regex patterns
- 🌿 **Multi-branch support** (main + beta prerelease)
- 📦 **Flexible npm publishing** (can be disabled for internal packages)
- ⚙️ **Customizable git assets and commit messages**

## Installation

```bash
# Install from GitHub (recommended)
npm install --save-dev git+https://github.com/ClashStrategic/release-config.git

# Install semantic-release and required plugins
npm install --save-dev semantic-release @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/npm @semantic-release/changelog @semantic-release/git @semantic-release/github
```

## Quick Start

1. **Create a `release.config.js` file** in your project root:

```javascript
// release.config.js
const buildConfig = require("@clash-strategic/release-config");

module.exports = buildConfig({
  // Repository-specific options
  npmPublish: false, // Set to true if you want to publish to npm
  gitAssets: ["CHANGELOG.md", "package.json", "package-lock.json"],
});
```

2. **Add the semantic-release script** to your `package.json`:

```json
{
  "scripts": {
    "semantic-release": "semantic-release"
  }
}
```

3. **Set up your CI/CD environment** with a GitHub token:

   - Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` permissions
   - Set it as `GITHUB_TOKEN` or `GH_TOKEN` environment variable in your CI/CD

4. **Generate GitHub Actions workflow** (optional but recommended):

```bash
# This will create .github/workflows/release.yml automatically
npx setup-release-workflow

# Or if you installed the package locally
npm run setup-workflow
```

5. **Run semantic-release** in your CI/CD pipeline:

```bash
npm run semantic-release
```

### Simple Configuration (Most Common)

```javascript
// release.config.js - For internal packages
const buildConfig = require("@clash-strategic/release-config");

module.exports = buildConfig({
  npmPublish: false,
  gitAssets: ["CHANGELOG.md", "package.json", "package-lock.json"],
});
```

### NPM Package Configuration

```javascript
// release.config.js - For packages published to npm
const buildConfig = require("@clash-strategic/release-config");

module.exports = buildConfig({
  npmPublish: true,
  gitAssets: ["CHANGELOG.md", "package.json", "package-lock.json"],
});
```

### Custom Configuration

```javascript
// release.config.js - With custom options
const buildConfig = require("@clash-strategic/release-config");

module.exports = buildConfig({
  npmPublish: false,
  gitAssets: ["CHANGELOG.md", "package.json", "src/version.php"],
  gitMessage:
    "🚀 Release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
  extraPrepare: [["./scripts/custom-build.js"]],
});
```

## Versatile update-version plugin

This package includes a versatile plugin to update versions and dates in any file using configurable regex patterns.

```javascript
// release.config.js
const {
  createUpdateVersionPlugin,
} = require("@clash-strategic/release-config");
const buildConfig = require("@clash-strategic/release-config");

// Configure the plugin to update specific files
const updateVersionPlugin = createUpdateVersionPlugin([
  {
    path: "src/MyClass.php",
    patterns: [
      {
        regex: /(const VERSION = \').*?(\';)/,
        replacement: "$1{version}$2",
      },
      {
        regex: /(const BUILD_DATE = \').*?(\';)/,
        replacement: "$1{datetime}$2",
      },
    ],
  },
  {
    path: "package.json",
    patterns: [
      {
        regex: /("version":\s*").*?(")/,
        replacement: "$1{version}$2",
      },
    ],
  },
]);

module.exports = buildConfig({
  extraPrepare: [updateVersionPlugin],
  gitAssets: ["CHANGELOG.md", "package.json", "src/MyClass.php"],
});
```

### Available Variables

- `{version}`: The new version (e.g., "1.2.3")
- `{datetime}`: Current date and time in ISO UTC format (e.g., "2025-08-18T17:49:22.549Z")

### Plugin Options

```javascript
createUpdateVersionPlugin(files, datetimeFormat);
```

- `files`: Array of file configurations
- `datetimeFormat`: Date format (default: 'iso')
  - `'iso'`: ISO 8601 UTC (default)
  - `'unix'`: Unix timestamp
  - `'custom'`: For future extensions

## Configuration Options

| Option         | Type    | Default                                                 | Description                        |
| -------------- | ------- | ------------------------------------------------------- | ---------------------------------- |
| `branches`     | Array   | `['main', { name: 'beta', prerelease: 'beta' }]`        | Branches to release from           |
| `npmPublish`   | Boolean | `false`                                                 | Whether to publish to npm registry |
| `gitAssets`    | Array   | `['CHANGELOG.md', 'package.json', 'package-lock.json']` | Files to include in release commit |
| `gitMessage`   | String  | `'chore(release): ${nextRelease.version} [skip ci]...'` | Commit message template            |
| `extraPrepare` | Array   | `[]`                                                    | Additional prepare plugins to run  |

## Commit Message Convention

This configuration uses [Conventional Commits](https://www.conventionalcommits.org/). Use these prefixes:

- `feat:` - New features (triggers minor version bump)
- `fix:` - Bug fixes (triggers patch version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Maintenance tasks

**Breaking changes:** Add `BREAKING CHANGE:` in commit body or use `!` after type (e.g., `feat!:`) to trigger major version bump.

## Testing

```bash
# Test the update-version plugin locally
node test-update-version.js

# Test semantic-release in dry-run mode (requires GITHUB_TOKEN)
npm run semantic-release -- --dry-run
```

## Automatic Workflow Generation

This package includes a convenient script to automatically generate GitHub Actions workflows:

### Basic Usage

```bash
# Generate a basic workflow with defaults
npx setup-release-workflow
```

### Programmatic Usage

```javascript
const {
  createGitHubWorkflow,
  setupWorkflow,
} = require("@clash-strategic/release-config");

// Generate workflow content only
const workflowContent = createGitHubWorkflow({
  name: "Release",
  branches: ["main", "develop"],
  nodeVersion: "18",
  runTests: true,
  testCommand: "npm test",
  buildCommand: "npm run build",
});

// Or create the workflow file directly
setupWorkflow({
  name: "Custom Release",
  branches: ["main"],
  nodeVersion: "20",
  runTests: true,
  additionalSteps: [
    {
      name: "Deploy to staging",
      run: "npm run deploy:staging",
      env: { STAGE: "staging" },
    },
  ],
});
```

### Workflow Options

| Option            | Type    | Default      | Description                         |
| ----------------- | ------- | ------------ | ----------------------------------- |
| `name`            | String  | `'Release'`  | Workflow name                       |
| `branches`        | Array   | `['main']`   | Branches that trigger the workflow  |
| `nodeVersion`     | String  | `'18'`       | Node.js version to use              |
| `runTests`        | Boolean | `false`      | Whether to run tests before release |
| `testCommand`     | String  | `'npm test'` | Command to run tests                |
| `buildCommand`    | String  | `null`       | Optional build command              |
| `additionalSteps` | Array   | `[]`         | Custom steps to add before release  |

## CI/CD Integration

### Generated GitHub Actions Workflow

When you run `npx setup-release-workflow`, it creates:

### GitLab CI Example

```yaml
# .gitlab-ci.yml
release:
  stage: release
  image: node:18
  script:
    - npm ci
    - npm run semantic-release
  variables:
    GITHUB_TOKEN: $CI_JOB_TOKEN
  only:
    - main
```

## Troubleshooting

### Common Issues

**Error: "No GitHub token specified"**

- Solution: Set `GITHUB_TOKEN` or `GH_TOKEN` environment variable

**Error: "Cannot find module '@semantic-release/...'"**

- Solution: Install missing plugins with npm

**Error: "Host key verification failed"**

- Solution: Use HTTPS instead of SSH for repository URL

**No release created despite commits**

- Check commit message format follows conventional commits
- Ensure commits contain `feat:`, `fix:`, or `BREAKING CHANGE:`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run semantic-release -- --dry-run`
5. Submit a pull request

## License

UNLICENSED - Internal use only for Clash Strategic projects.
