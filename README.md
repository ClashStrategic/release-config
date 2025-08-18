# @clash-strategic/release-config

Shared semantic-release configuration for Clash Strategic repositories.

## Installation

```bash
# From local/private repository
npm install file:../path/to/shared-semantic-config

# Or from private git repository
npm install git+ssh://git@github.com:clash-strategic/release-config.git
```

## Basic Usage

```javascript
// release.config.js
const buildConfig = require("@clash-strategic/release-config");

module.exports = buildConfig({
  // Repository-specific options
  extraPrepare: [["./scripts/custom-script.js"]],
  gitAssets: ["CHANGELOG.md", "package.json", "custom-file.php"],
  npmPublish: false,
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

- `branches`: Array of branches (default: main + beta prerelease)
- `npmPublish`: Boolean to publish to npm (default: false)
- `extraPrepare`: Array of additional prepare plugins
- `gitAssets`: Array of files for the release commit
- `gitMessage`: Custom commit message

## Testing

```bash
# Test the update-version plugin
node shared-semantic-config/test-update-version.js
```
