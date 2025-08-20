# @clash-strategic/release-config

Shared semantic-release configuration for Clash Strategic repositories. This package provides a **simple and easy-to-use** configuration for automated versioning, changelog generation, and releases across all our projects.

## ✨ Features

- 🚀 **Automated versioning** using semantic-release
- 📝 **Automatic changelog generation**
- 🔄 **Configurable file version updates** with regex patterns
- 🌿 **Multi-branch support** (main + beta prerelease)
- 📦 **Flexible npm publishing** (can be disabled for internal packages)
- ⚙️ **Customizable git assets and commit messages**
- 🎯 **Simple convenience functions** for common use cases
- 📋 **GitHub Actions workflow generation**
- ✅ **Configuration validation** with detailed feedback and suggestions

## 📦 Installation

```bash
# Install from GitHub (recommended)
npm install --save-dev git+https://github.com/ClashStrategic/release-config.git

# Install semantic-release and required plugins
npm install --save-dev semantic-release @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/npm @semantic-release/changelog @semantic-release/git @semantic-release/github
```

## 🚀 Quick Start

### ⚡ Simple Setup (Recommended)

**For npm packages:**

```javascript
// release.config.js
const createConfig = require("@clash-strategic/release-config");

module.exports = createConfig({ npmPublish: true });
```

**For non-npm projects:**

```javascript
// release.config.js
const createConfig = require("@clash-strategic/release-config");

module.exports = createConfig({ npmPublish: false });
```

**Generate GitHub Actions workflow (auto-detects your configuration):**

```bash
# Automatically detects your project configuration and generates workflow
npx setup-release-workflow
```

**Or programmatically:**

```javascript
// scripts/setup-workflow.js
const { createSmartWorkflow } = require("@clash-strategic/release-config");
const fs = require("fs");

// Auto-detects branches, tests, build commands, Node.js version, etc.
const workflow = createSmartWorkflow();
fs.mkdirSync(".github/workflows", { recursive: true });
fs.writeFileSync(".github/workflows/release.yml", workflow);
```

### 📋 Complete Setup Steps

1. **Add semantic-release script** to your `package.json`:

```json
{
  "scripts": {
    "semantic-release": "semantic-release"
  }
}
```

2. **Set up GitHub token** in your CI/CD:

   - Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` permissions
   - Set it as `GITHUB_TOKEN` environment variable

3. **Run semantic-release** in your CI/CD pipeline:

```bash
npm run semantic-release
```

## 🎯 Usage Examples

### 🔧 Simple Configurations

**Default export (classic way):**

```javascript
// release.config.js
const createConfig = require("@clash-strategic/release-config");

module.exports = createConfig({ npmPublish: true });
```

**Named exports for specific functions:**

```javascript
// Using named exports
const {
  buildSemanticReleaseConfig,
  createGitHubWorkflow,
} = require("@clash-strategic/release-config");

// For npm packages
const config = buildSemanticReleaseConfig({ npmPublish: true });

// For non-npm projects
const config = buildSemanticReleaseConfig({ npmPublish: false });

// GitHub Actions workflow
const workflow = createGitHubWorkflow({ runTests: true });
```

### 🚀 Advanced Configurations

**Custom branches and assets:**

```javascript
const createConfig = require("@clash-strategic/release-config");

module.exports = createConfig({
  npmPublish: true,
  branches: ["main", "develop"],
  gitAssets: ["CHANGELOG.md", "package.json", "src/version.php"],
  gitMessage:
    "🚀 Release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
});
```

**With custom build steps:**

```javascript
const {
  buildSemanticReleaseConfig,
} = require("@clash-strategic/release-config");

module.exports = buildSemanticReleaseConfig({
  npmPublish: false,
  extraPrepare: [["@semantic-release/exec", { prepareCmd: "npm run build" }]],
  gitAssets: ["CHANGELOG.md", "package.json", "dist/"],
});
```

## 🔄 Version Update Plugin

This package includes a versatile plugin to update versions and dates in any file using configurable patterns.

### 📝 Simple Usage

```javascript
const {
  buildSemanticReleaseConfig,
  createUpdateVersionPlugin,
} = require("@clash-strategic/release-config");

// Update version in custom files
const versionPlugin = createUpdateVersionPlugin([
  {
    path: "src/version.js",
    pattern: "version-regex-pattern",
    replacement: 'export const VERSION = "${version}";',
  },
  {
    path: "VERSION.txt",
    pattern: "any-pattern",
    replacement: "${version}",
  },
]);

module.exports = buildSemanticReleaseConfig({
  npmPublish: true,
  extraPrepare: [versionPlugin],
  gitAssets: ["CHANGELOG.md", "package.json", "src/version.js", "VERSION.txt"],
});
```

### 🔧 Advanced Pattern Configuration

```javascript
const {
  createUpdateVersionPlugin,
} = require("@clash-strategic/release-config");

const updateVersionPlugin = createUpdateVersionPlugin(
  [
    {
      path: "src/MyClass.php",
      pattern: /(const VERSION = \').*?(\';)/,
      replacement: "$1${version}$2",
    },
    {
      path: "src/MyClass.php",
      pattern: /(const BUILD_DATE = \').*?(\';)/,
      replacement: "$1${date}$2",
    },
  ],
  "iso"
); // Date format: 'iso', 'locale', or custom
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

## ✅ Configuration Validation

This package includes a powerful validation function to check your semantic-release configuration and provide helpful feedback.

### 🔍 CLI Validation Tool

```bash
# Validate your current release.config.js
npm run validate-config

# Validate a specific config file
npm run validate-config path/to/config.js

# Or use the CLI directly
npx validate-release-config
```

### 📝 Programmatic Validation

```javascript
const { validateConfig } = require("@clash-strategic/release-config");

// Validate a configuration object
const config = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
};

const result = validateConfig(config);

if (result.isValid) {
  console.log("✅ Configuration is valid!");
} else {
  console.log("❌ Configuration errors:", result.errors);
  console.log("⚠️ Warnings:", result.warnings);
}

console.log("📊 Summary:", result.summary);
```

### 🔧 Validation Options

```javascript
const result = validateConfig(config, {
  strict: false, // Treat warnings as errors
  checkPlugins: true, // Validate plugin configurations
  verbose: true, // Include detailed explanations
});
```

### 📋 Validation Features

- **Structure validation** - Ensures required fields are present and correctly typed
- **Plugin validation** - Checks for recommended plugins and configurations
- **Branch validation** - Validates branch configurations
- **Detailed feedback** - Provides errors, warnings, and suggestions
- **Summary report** - Shows configuration overview and detected features

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

# Test workflow generation
node -e "const {createBasicWorkflow} = require('./index.js'); console.log(createBasicWorkflow());"
```

## 🤖 Smart Workflow Generation

This package includes intelligent workflow generation that automatically detects your project configuration:

### ⚡ Quick Setup (Recommended)

```bash
# Automatically detects and generates workflow for your project
npx setup-release-workflow
```

**What it detects:**

- 🌿 Release branches from your semantic-release config
- 🧪 Test commands and whether to run tests
- 🏗️ Build commands if available
- 📦 Node.js version from package.json engines
- 🔧 Additional scripts like lint, typecheck, etc.
- 📋 Whether it's an npm package or not

### 🎯 Smart Programmatic Usage

```javascript
const {
  createSmartWorkflow,
  detectUserConfiguration,
} = require("@clash-strategic/release-config");

// Auto-detect everything and generate workflow
const workflow = createSmartWorkflow();

// Or detect configuration first, then customize
const config = detectUserConfiguration();
console.log("Detected:", config);

const workflow = createSmartWorkflow({
  name: "Custom Release Pipeline",
  // Override specific settings while keeping smart defaults
  runTests: true,
});
```

### 🔧 Manual Configuration (Advanced)

```javascript
const { createGitHubWorkflow } = require("@clash-strategic/release-config");

// Disable auto-detection and specify everything manually
const workflowContent = createGitHubWorkflow({
  autoDetect: false,
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
