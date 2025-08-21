# @clash-strategic/release-config

Shared semantic-release configuration for Clash Strategic repositories. This package provides a **simple and easy-to-use** configuration for automated versioning, changelog generation, and releases across all our projects.

## ✨ Features

- 🚀 **Automated versioning** using semantic-release
- 📝 **Automatic changelog generation**
- 🔄 **Dual-format file version updates** - Simple & Advanced patterns with regex
- 🌿 **Multi-branch support** (main + beta prerelease)
- 📦 **Flexible npm publishing** (can be disabled for internal packages)
- ⚙️ **Customizable git assets and commit messages**
- 🎯 **Simple convenience functions** for common use cases
- 📋 **GitHub Actions workflow generation** with smart auto-detection
- ✅ **Advanced configuration validation** with dry-run simulation
- 🔍 **Smart error detection** with typo suggestions and file validation
- 🧪 **Dry-run testing** - Validates regex patterns against actual files without modifications

## 📦 Installation

This package now bundles all necessary `semantic-release` plugins, so you only need to install this one package.

```bash
# Install from GitHub (recommended)
npm install --save-dev git+https://github.com/ClashStrategic/release-config.git
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

This package includes a versatile plugin to update versions and dates in any file using configurable patterns. **Supports two formats**: simple (single pattern per file) and advanced (multiple patterns per file).

### 📝 Simple Format (Recommended for single patterns)

```javascript
const {
  buildSemanticReleaseConfig,
  createUpdateVersionPlugin,
} = require("@clash-strategic/release-config");

// Simple format - one pattern per file
const versionPlugin = createUpdateVersionPlugin([
  {
    path: "src/version.js",
    pattern: /export const VERSION = ".*?";/,
    replacement: 'export const VERSION = "${version}";',
  },
  {
    path: "VERSION.txt",
    pattern: /\d+\.\d+\.\d+/,
    replacement: "${version}",
  },
]);

module.exports = buildSemanticReleaseConfig({
  npmPublish: true,
  extraPrepare: [versionPlugin],
  gitAssets: ["CHANGELOG.md", "package.json", "src/version.js", "VERSION.txt"],
});
```

### 🔧 Advanced Format (Multiple patterns per file)

```javascript
const {
  createUpdateVersionPlugin,
} = require("@clash-strategic/release-config");

// Advanced format - multiple patterns per file
const updateVersionPlugin = createUpdateVersionPlugin(
  [
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
  ],
  "iso"
);
```

### 🎯 Real-world Example (PHP Class)

```javascript
const updateVersionPlugin = createUpdateVersionPlugin([
  {
    path: "DeckAnalyzer.php",
    patterns: [
      {
        regex: /(private string \$VERSION = \").*?(\";)/,
        replacement: "$1{version}$2",
      },
      {
        regex: /(private string \$DATETIME_VERSION = \").*?(\";)/,
        replacement: "$1{datetime}$2",
      },
    ],
  },
]);
```

### 🔤 Available Variables

- **`{version}`** / **`${version}`**: The new version (e.g., "1.2.3")
- **`{datetime}`** / **`${date}`**: Current date and time in ISO UTC format (e.g., "2025-08-18T17:49:22.549Z")

### ⚙️ Plugin Options

```javascript
createUpdateVersionPlugin(files, datetimeFormat);
```

- **`files`**: Array of file configurations (supports both simple and advanced format)
- **`datetimeFormat`**: Date format (default: 'iso')
  - `'iso'`: ISO 8601 UTC (default)
  - `'unix'`: Unix timestamp
  - `'custom'`: For future extensions

### 📋 Format Comparison

| Feature      | Simple Format                    | Advanced Format                                |
| ------------ | -------------------------------- | ---------------------------------------------- |
| **Use case** | Single pattern per file          | Multiple patterns per file                     |
| **Syntax**   | `{ path, pattern, replacement }` | `{ path, patterns: [{ regex, replacement }] }` |
| **Best for** | Most common scenarios            | Complex files with multiple version fields     |

## ✅ Configuration Validation

This package includes a **powerful validation system** that not only checks your semantic-release configuration but also **simulates the execution** of custom plugins to ensure they work correctly with your actual files.

### 🔍 CLI Validation Tool

```bash
# Validate your current release.config.js
npm run validate-config

# Validate a specific config file
npm run validate-config path/to/config.js

# Or use the CLI directly
npx validate-release-config
```

### 🎯 Example Validation Output

```bash
🔍 Semantic Release Configuration Validator
==================================================

📋 Validating: ./release.config.js
--------------------------------------------------
✅ Configuration is VALID

⚠️  WARNINGS:
  1. update-version plugin #1, file #1, pattern #1: regex pattern does not match any content in the file

💡 SUGGESTIONS:
  1. update-version plugin #1, file #1: dry-run successful - 2 pattern(s) would match
  2. Configuration structure is valid
  3. NPM plugin detected - good for publishing packages
  4. Git plugin detected - will commit release changes
  5. GitHub plugin detected - will create GitHub releases

📊 SUMMARY:
  • Valid Structure: ✅
  • Branches: 2
  • Plugins: 7
  • NPM Plugin: ✅
  • Git Plugin: ✅
  • GitHub Plugin: ✅

🎉 Configuration validation completed successfully!
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

### 🚀 Advanced Validation Features

#### 🔍 **Dry-Run Simulation** (NEW!)

The validator now **simulates the execution** of `update-version` plugins without modifying your files:

- ✅ **Tests regex patterns** against actual file content
- ✅ **Validates replacements** work correctly
- ✅ **Detects missing files** before release
- ✅ **Warns about non-matching patterns**
- ✅ **Counts successful matches**

#### 🛠️ **Smart Error Detection**

- **Typo detection**: `pathss` → suggests `path`
- **Property validation**: Ensures required fields are present
- **Format validation**: Supports both simple and advanced plugin formats
- **File existence**: Checks if target files exist

#### 📋 **Comprehensive Validation**

- **Structure validation** - Ensures required fields are present and correctly typed
- **Plugin validation** - Checks for recommended plugins and configurations
- **Branch validation** - Validates branch configurations
- **Custom plugin validation** - Deep validation of update-version plugins
- **Detailed feedback** - Provides errors, warnings, and suggestions
- **Summary report** - Shows configuration overview and detected features

### 🚨 Error Types Detected

#### ❌ **Errors** (Configuration Invalid)

- `missing required "path" property` - Missing required fields
- `unknown property "pathss". Did you mean: path?` - Typos with suggestions
- `target file not found: MyFile.php` - Missing target files
- `regex error - Invalid regular expression` - Invalid regex patterns
- `must have either "patterns" array or both "pattern" and "replacement" properties` - Invalid structure

#### ⚠️ **Warnings** (Configuration Valid but Issues Found)

- `regex pattern does not match any content in the file` - Pattern won't match anything
- `pattern matches but replacement produces no changes` - Replacement doesn't change content
- `replacement still contains unreplaced placeholders` - Unused placeholders like `{version}`

#### 💡 **Suggestions** (Helpful Information)

- `dry-run successful - 2 pattern(s) would match` - Successful validation
- `Configuration structure is valid` - Structure is correct
- `NPM plugin detected - good for publishing packages` - Plugin recommendations

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
