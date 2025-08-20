/*
 * Shared semantic-release config builder for Clash Strategic repos (internal use)
 *
 * This module provides simple functions to create semantic-release configurations,
 * GitHub Actions workflows, and version update plugins.
 */

const path = require('path');

/**
 * Creates a semantic-release configuration with sensible defaults.
 *
 * @param {Object} [options={}] - Configuration options
 * @param {Array|string} [options.branches=['main', {name: 'beta', prerelease: 'beta'}]] - Branches to release from
 * @param {boolean} [options.npmPublish=false] - Whether to publish to npm registry
 * @param {Array<string>} [options.gitAssets=['CHANGELOG.md', 'package.json', 'package-lock.json']] - Files to commit during release
 * @param {string} [options.gitMessage] - Custom git commit message template
 * @param {Array} [options.extraPrepare=[]] - Additional prepare plugins to run before git commit
 *
 * @returns {Object} Complete semantic-release configuration object
 *
 * @example
 * // Basic usage - creates config for main branch only, no npm publishing
 * const config = buildSemanticReleaseConfig();
 *
 * @example
 * // Enable npm publishing
 * const config = buildSemanticReleaseConfig({ npmPublish: true });
 *
 * @example
 * // Custom branches and additional files to commit
 * const config = buildSemanticReleaseConfig({
 *   branches: ['main', 'develop'],
 *   gitAssets: ['CHANGELOG.md', 'package.json', 'version.txt'],
 *   extraPrepare: [['@semantic-release/exec', { prepareCmd: 'npm run build' }]]
 * });
 */
function buildSemanticReleaseConfig(options = {}) {
  // Handle null/undefined options
  const opts = options || {};

  const {
    branches = [
      'main',
      { name: 'beta', prerelease: 'beta' }
    ],
    npmPublish = false,
    gitAssets = ['CHANGELOG.md', 'package.json', 'package-lock.json'],
    gitMessage = 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    extraPrepare = []
  } = opts;

  const plugins = [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/npm', { npmPublish }],
    '@semantic-release/changelog',
    ...extraPrepare,
    ['@semantic-release/git', { assets: gitAssets, message: gitMessage }],
    '@semantic-release/github'
  ];

  return {
    branches,
    plugins
  };
}

/**
 * Creates a plugin configuration for updating version information in custom files.
 *
 * This function generates a semantic-release plugin that can update version numbers
 * and timestamps in any text-based files during the release process.
 *
 * @param {Array<Object>} files - Array of file configurations to update
 * @param {string} files[].path - Path to the file to update
 * @param {string} files[].pattern - Regex pattern to find the version/date to replace
 * @param {string} files[].replacement - Replacement string (supports ${version} and ${date} placeholders)
 * @param {string} [datetimeFormat='iso'] - Format for date replacement ('iso', 'locale', or custom format)
 *
 * @returns {Array} Plugin configuration array for semantic-release
 *
 * @example
 * // Update version in a Python __init__.py file
 * const versionPlugin = createUpdateVersionPlugin([
 *   {
 *     path: 'src/__init__.py',
 *     pattern: 'version-regex-pattern',
 *     replacement: '__version__ = "${version}"'
 *   }
 * ]);
 *
 * @example
 * // Update multiple files with version and date
 * const versionPlugin = createUpdateVersionPlugin([
 *   {
 *     path: 'VERSION.txt',
 *     pattern: 'version-pattern',
 *     replacement: '${version}'
 *   },
 *   {
 *     path: 'RELEASE_DATE.txt',
 *     pattern: 'date-pattern',
 *     replacement: '${date}'
 *   }
 * ], 'locale');
 */
function createUpdateVersionPlugin(files, datetimeFormat = 'iso') {
  return [
    path.join(__dirname, 'update-version.js'),
    {
      files,
      datetimeFormat
    }
  ];
}

/**
 * Validates a semantic-release configuration object and provides helpful feedback.
 *
 * This function checks if a semantic-release configuration is valid and follows
 * best practices. It returns detailed information about the configuration status.
 *
 * @param {Object|string} config - The semantic-release configuration object or path to config file
 * @param {Object} [options={}] - Validation options
 * @param {boolean} [options.strict=false] - Whether to use strict validation (fails on warnings)
 * @param {boolean} [options.checkPlugins=true] - Whether to validate plugin configurations
 * @param {boolean} [options.verbose=false] - Whether to include detailed explanations
 *
 * @returns {Object} Validation result object
 * @returns {boolean} returns.isValid - Whether the configuration is valid
 * @returns {Array<string>} returns.errors - Array of error messages
 * @returns {Array<string>} returns.warnings - Array of warning messages
 * @returns {Array<string>} returns.suggestions - Array of improvement suggestions
 * @returns {Object} returns.summary - Summary of configuration analysis
 *
 * @example
 * // Validate current configuration
 * const result = validateConfig(require('./release.config.js'));
 * if (!result.isValid) {
 *   console.log('Errors:', result.errors);
 * }
 *
 * @example
 * // Validate with strict mode
 * const result = validateConfig(config, { strict: true, verbose: true });
 * console.log('Summary:', result.summary);
 */
function validateConfig(config, options = {}) {
  const opts = options || {};
  const {
    strict = false,
    checkPlugins = true,
    verbose = false
  } = opts;

  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    summary: {}
  };

  // Handle string input (file path)
  if (typeof config === 'string') {
    try {
      config = require(path.resolve(config));
    } catch (error) {
      result.errors.push(`Failed to load config file: ${error.message}`);
      result.isValid = false;
      return result;
    }
  }

  // Check if config is an object
  if (!config || typeof config !== 'object') {
    result.errors.push('Configuration must be an object');
    result.isValid = false;
    return result;
  }

  // Validate branches
  if (!config.branches) {
    result.warnings.push('No branches specified, semantic-release will use defaults');
  } else if (!Array.isArray(config.branches)) {
    result.errors.push('Branches must be an array');
    result.isValid = false;
  } else if (config.branches.length === 0) {
    result.errors.push('At least one branch must be specified');
    result.isValid = false;
  }

  // Validate plugins
  if (!config.plugins) {
    result.errors.push('No plugins specified');
    result.isValid = false;
  } else if (!Array.isArray(config.plugins)) {
    result.errors.push('Plugins must be an array');
    result.isValid = false;
  } else if (config.plugins.length === 0) {
    result.errors.push('At least one plugin must be specified');
    result.isValid = false;
  }

  // Check for required plugins if plugins validation is enabled
  if (checkPlugins && config.plugins && Array.isArray(config.plugins)) {
    const pluginNames = config.plugins.map(p => Array.isArray(p) ? p[0] : p);

    const requiredPlugins = [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator'
    ];

    requiredPlugins.forEach(required => {
      if (!pluginNames.includes(required)) {
        result.warnings.push(`Missing recommended plugin: ${required}`);
      }
    });

    // Check for npm plugin configuration
    const npmPlugin = config.plugins.find(p =>
      (Array.isArray(p) && p[0] === '@semantic-release/npm') || p === '@semantic-release/npm'
    );

    if (npmPlugin && Array.isArray(npmPlugin) && npmPlugin[1]) {
      const npmConfig = npmPlugin[1];
      if (npmConfig.npmPublish === undefined) {
        result.suggestions.push('Consider explicitly setting npmPublish option for @semantic-release/npm plugin');
      }
    }
  }

  // Generate summary
  result.summary = {
    hasValidStructure: result.errors.length === 0,
    branchCount: config.branches && Array.isArray(config.branches) ? config.branches.length : 0,
    pluginCount: config.plugins && Array.isArray(config.plugins) ? config.plugins.length : 0,
    hasNpmPlugin: config.plugins && Array.isArray(config.plugins) ? config.plugins.some(p =>
      (Array.isArray(p) && p[0] === '@semantic-release/npm') || p === '@semantic-release/npm'
    ) : false,
    hasGitPlugin: config.plugins && Array.isArray(config.plugins) ? config.plugins.some(p =>
      (Array.isArray(p) && p[0] === '@semantic-release/git') || p === '@semantic-release/git'
    ) : false,
    hasGitHubPlugin: config.plugins && Array.isArray(config.plugins) ? config.plugins.some(p =>
      (Array.isArray(p) && p[0] === '@semantic-release/github') || p === '@semantic-release/github'
    ) : false
  };

  // Add verbose explanations if requested
  if (verbose) {
    if (result.summary.hasValidStructure) {
      result.suggestions.push('Configuration structure is valid');
    }
    if (result.summary.hasNpmPlugin) {
      result.suggestions.push('NPM plugin detected - good for publishing packages');
    }
    if (result.summary.hasGitPlugin) {
      result.suggestions.push('Git plugin detected - will commit release changes');
    }
    if (result.summary.hasGitHubPlugin) {
      result.suggestions.push('GitHub plugin detected - will create GitHub releases');
    }
  }

  // Apply strict mode
  if (strict && result.warnings.length > 0) {
    result.isValid = false;
  }

  return result;
}

/**
 * Detects user configuration from the current project to generate appropriate workflow settings.
 *
 * This function analyzes the current project's package.json, semantic-release config,
 * and other configuration files to automatically determine the best workflow settings.
 *
 * @param {string} [projectPath=process.cwd()] - Path to the project directory
 * @returns {Object} Detected configuration object
 * @returns {Array<string>} returns.branches - Detected release branches
 * @returns {string} returns.nodeVersion - Detected or recommended Node.js version
 * @returns {boolean} returns.runTests - Whether tests should be run
 * @returns {string|null} returns.testCommand - Command to run tests
 * @returns {string|null} returns.buildCommand - Command to build the project
 * @returns {boolean} returns.isNpmPackage - Whether this is an npm package
 * @returns {Array<string>} returns.additionalScripts - Other relevant scripts found
 */
function detectUserConfiguration(projectPath = process.cwd()) {
  const fs = require('fs');

  const config = {
    branches: ['main'],
    nodeVersion: 'lts/*',
    runTests: false,
    testCommand: null,
    buildCommand: null,
    isNpmPackage: false,
    additionalScripts: []
  };

  try {
    // Read package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Detect if it's an npm package
      config.isNpmPackage = !packageJson.private && (packageJson.name && packageJson.name.startsWith('@') || packageJson.publishConfig);

      // Detect Node.js version from engines
      if (packageJson.engines && packageJson.engines.node) {
        const nodeVersion = packageJson.engines.node;
        // Convert common patterns to GitHub Actions format
        if (nodeVersion.includes('>=')) {
          const minVersion = nodeVersion.replace(/[^\d.]/g, '');
          config.nodeVersion = minVersion;
        } else if (nodeVersion.includes('^') || nodeVersion.includes('~')) {
          config.nodeVersion = nodeVersion.replace(/[^\d.]/g, '');
        } else {
          config.nodeVersion = nodeVersion;
        }
      }

      // Detect scripts
      if (packageJson.scripts) {
        const scripts = packageJson.scripts;

        // Test detection - be conservative, only enable if explicitly configured
        // Check for CI-specific test scripts first (these indicate intention to run tests in CI)
        if (scripts['test:ci']) {
          config.runTests = true;
          config.testCommand = 'npm run test:ci';
        } else if (scripts['test:prod'] || scripts['test:production']) {
          config.runTests = true;
          config.testCommand = scripts['test:prod'] ? 'npm run test:prod' : 'npm run test:production';
        } else if (scripts.test &&
          scripts.test !== 'echo "Error: no test specified" && exit 1' &&
          scripts.test !== 'exit 1' &&
          !scripts.test.includes('no test specified')) {
          // Only enable regular test script if it's not the default npm placeholder
          // and if there are actual test files or test frameworks detected
          const hasTestFramework = scripts.jest || scripts.mocha || scripts.vitest ||
            scripts.ava || scripts.tap || scripts.nyc ||
            packageJson.devDependencies && (
              packageJson.devDependencies.jest ||
              packageJson.devDependencies.mocha ||
              packageJson.devDependencies.vitest ||
              packageJson.devDependencies.ava ||
              packageJson.devDependencies.tap ||
              packageJson.devDependencies['@testing-library/react'] ||
              packageJson.devDependencies['@testing-library/vue'] ||
              packageJson.devDependencies.cypress ||
              packageJson.devDependencies.playwright
            );

          if (hasTestFramework) {
            config.runTests = true;
            config.testCommand = 'npm test';
          }
        }

        // Check for specific test framework scripts
        if (!config.runTests) {
          if (scripts.jest) {
            config.runTests = true;
            config.testCommand = 'npm run jest';
          } else if (scripts.mocha) {
            config.runTests = true;
            config.testCommand = 'npm run mocha';
          } else if (scripts.vitest) {
            config.runTests = true;
            config.testCommand = 'npm run vitest';
          }
        }

        // Build detection
        if (scripts.build) {
          config.buildCommand = 'npm run build';
        } else if (scripts.compile) {
          config.buildCommand = 'npm run compile';
        } else if (scripts.dist) {
          config.buildCommand = 'npm run dist';
        }

        // Additional useful scripts
        ['lint', 'format', 'typecheck', 'validate'].forEach(scriptName => {
          if (scripts[scriptName]) {
            config.additionalScripts.push(scriptName);
          }
        });
      }
    }

    // Read semantic-release configuration
    const releaseConfigPaths = [
      'release.config.js',
      'release.config.json',
      '.releaserc.js',
      '.releaserc.json',
      '.releaserc'
    ];

    for (const configPath of releaseConfigPaths) {
      const fullPath = path.join(projectPath, configPath);
      if (fs.existsSync(fullPath)) {
        try {
          let releaseConfig;
          if (configPath.endsWith('.json') || configPath === '.releaserc') {
            releaseConfig = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          } else {
            // For .js files, we need to actually execute them to get the real config
            delete require.cache[require.resolve(fullPath)];
            releaseConfig = require(fullPath);
          }

          if (releaseConfig && releaseConfig.branches) {
            // Extract branch names from semantic-release branch config
            config.branches = releaseConfig.branches.map(branch => {
              if (typeof branch === 'string') return branch;
              if (typeof branch === 'object' && branch.name) return branch.name;
              return 'main'; // fallback
            }).filter(Boolean);
          }
          break;
        } catch (error) {
          // Continue to next config file if this one fails
          console.warn(`Warning: Could not parse ${configPath}: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.warn(`Warning: Error detecting configuration: ${error.message}`);
  }

  return config;
}

/**
 * Creates a complete GitHub Actions workflow for semantic-release.
 *
 * This function generates a ready-to-use GitHub Actions workflow YAML content
 * that can be saved to .github/workflows/release.yml in your repository.
 *
 * When called without options, it automatically detects the user's current configuration
 * from package.json, semantic-release config, and other project files.
 *
 * @param {Object} [options={}] - Workflow configuration options
 * @param {string} [options.name='Release'] - Name of the GitHub Actions workflow
 * @param {Array<string>|string} [options.branches] - Branches that trigger the release workflow (auto-detected if not provided)
 * @param {string} [options.nodeVersion] - Node.js version to use (auto-detected if not provided)
 * @param {boolean} [options.runTests] - Whether to run tests before releasing (auto-detected if not provided)
 * @param {string} [options.testCommand] - Command to run tests (auto-detected if not provided)
 * @param {string|null} [options.buildCommand] - Optional build command to run before release (auto-detected if not provided)
 * @param {Array<Object|string>} [options.additionalSteps=[]] - Custom steps to add before release
 * @param {Object} [options.permissions] - GitHub token permissions for the workflow
 * @param {boolean} [options.autoDetect=true] - Whether to auto-detect configuration from project files
 * @param {string} [options.projectPath=process.cwd()] - Path to project for auto-detection
 *
 * @returns {string} Complete GitHub Actions workflow YAML content
 *
 * @example
 * // Auto-detect configuration from current project
 * const workflow = createGitHubWorkflow();
 *
 * @example
 * // Override specific settings while keeping auto-detection for others
 * const workflow = createGitHubWorkflow({
 *   name: 'CI/CD Release',
 *   runTests: true // Force tests even if not detected
 * });
 *
 * @example
 * // Completely manual configuration (disable auto-detection)
 * const workflow = createGitHubWorkflow({
 *   autoDetect: false,
 *   branches: ['main', 'develop'],
 *   runTests: true,
 *   buildCommand: 'npm run build'
 * });
 *
 * @example
 * // Workflow with custom steps
 * const workflow = createGitHubWorkflow({
 *   additionalSteps: [
 *     { name: 'Lint code', run: 'npm run lint' },
 *     { name: 'Upload coverage', uses: 'codecov/codecov-action@v3' }
 *   ]
 * });
 */
function createGitHubWorkflow(options = {}) {
  // Handle null/undefined options
  const opts = options || {};

  // Auto-detect configuration if enabled
  const autoDetect = opts.autoDetect !== false; // Default to true
  const projectPath = opts.projectPath || process.cwd();

  let detectedConfig = {};
  if (autoDetect) {
    detectedConfig = detectUserConfiguration(projectPath);
  }

  const {
    name = 'Release',
    branches = detectedConfig.branches || ['main'],
    nodeVersion = detectedConfig.nodeVersion || 'lts/*',
    runTests = detectedConfig.runTests !== undefined ? detectedConfig.runTests : false,
    testCommand = detectedConfig.testCommand || 'npm test',
    buildCommand = detectedConfig.buildCommand || null,
    additionalSteps = [],
    permissions = {
      contents: 'write',
      'id-token': 'write'
    }
  } = opts;

  const branchesArray = Array.isArray(branches) ? branches : [branches];
  const branchesStr = branchesArray.map(b => `"${b}"`).join(', ');

  let steps = [
    '      - name: Checkout',
    '        uses: actions/checkout@v4',
    '        with:',
    '          fetch-depth: 0',
    '',
    '      - name: Setup Node.js',
    '        uses: actions/setup-node@v4',
    '        with:',
    `          node-version: "${nodeVersion}"`,
    '',
    '      - name: Install dependencies',
    '        run: npm ci'
  ];

  if (buildCommand) {
    steps.push('');
    steps.push('      - name: Build');
    steps.push(`        run: ${buildCommand}`);
  }

  if (runTests) {
    steps.push('');
    steps.push('      - name: Run tests');
    steps.push(`        run: ${testCommand}`);
  }

  // Add additional custom steps
  if (additionalSteps.length > 0) {
    steps.push('');
    additionalSteps.forEach(step => {
      if (typeof step === 'string') {
        steps.push(`      - name: ${step}`);
        steps.push(`        run: ${step}`);
      } else {
        steps.push(`      - name: ${step.name}`);
        if (step.uses) {
          steps.push(`        uses: ${step.uses}`);
          if (step.with) {
            steps.push('        with:');
            Object.entries(step.with).forEach(([key, value]) => {
              steps.push(`          ${key}: ${value}`);
            });
          }
        } else if (step.run) {
          steps.push(`        run: ${step.run}`);
        }
        if (step.env) {
          steps.push('        env:');
          Object.entries(step.env).forEach(([key, value]) => {
            steps.push(`          ${key}: ${value}`);
          });
        }
      }
      steps.push('');
    });
  }

  steps.push('');
  steps.push('      - name: Release');
  steps.push('        run: npm run semantic-release');
  steps.push('        env:');
  steps.push('          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}');

  let permissionsBlock = '';
  if (permissions && Object.keys(permissions).length > 0) {
    const lines = ['    permissions:'];
    Object.entries(permissions).forEach(([key, value]) => {
      lines.push(`      ${key}: ${value}`);
    });
    permissionsBlock = lines.join('\n') + '\n';
  }

  const workflow = `name: ${name}

on:
  push:
    branches: [${branchesStr}]

jobs:
  release:
    runs-on: ubuntu-latest

${permissionsBlock}
    steps:
${steps.join('\n')}
`;

  return workflow;
}

/**
 * Creates a GitHub Actions workflow with smart defaults based on the current project.
 *
 * This is a convenience function that automatically detects your project configuration
 * and generates an appropriate workflow. It's the recommended way to generate workflows
 * for most projects.
 *
 * @param {Object} [overrides={}] - Optional overrides for specific settings
 * @returns {string} Complete GitHub Actions workflow YAML content
 *
 * @example
 * // Generate workflow with smart defaults
 * const workflow = createSmartWorkflow();
 *
 * @example
 * // Override specific settings while keeping smart defaults for others
 * const workflow = createSmartWorkflow({
 *   name: 'Custom Release Pipeline',
 *   runTests: true // Force tests even if not detected
 * });
 */
function createSmartWorkflow(overrides = {}) {
  const detectedConfig = detectUserConfiguration();

  // Merge detected config with any user overrides
  const workflowOptions = {
    name: 'Release',
    branches: detectedConfig.branches,
    nodeVersion: detectedConfig.nodeVersion,
    runTests: detectedConfig.runTests,
    testCommand: detectedConfig.testCommand,
    buildCommand: detectedConfig.buildCommand,
    ...overrides // User overrides take precedence
  };

  // Add smart additional steps based on detected scripts
  if (!overrides.additionalSteps && detectedConfig.additionalScripts.length > 0) {
    const additionalSteps = [];

    // Add lint step if available
    if (detectedConfig.additionalScripts.includes('lint')) {
      additionalSteps.push({
        name: 'Lint code',
        run: 'npm run lint'
      });
    }

    // Add typecheck step if available
    if (detectedConfig.additionalScripts.includes('typecheck')) {
      additionalSteps.push({
        name: 'Type check',
        run: 'npm run typecheck'
      });
    }

    workflowOptions.additionalSteps = additionalSteps;
  }

  return createGitHubWorkflow({
    ...workflowOptions,
    autoDetect: false // We already detected, no need to detect again
  });
}

// Export the main function as default export for simple usage
module.exports = buildSemanticReleaseConfig;

// Export all functions for flexibility
module.exports.buildSemanticReleaseConfig = buildSemanticReleaseConfig;
module.exports.createUpdateVersionPlugin = createUpdateVersionPlugin;
module.exports.createGitHubWorkflow = createGitHubWorkflow;
module.exports.createSmartWorkflow = createSmartWorkflow;
module.exports.detectUserConfiguration = detectUserConfiguration;
module.exports.validateConfig = validateConfig;

/**
 * @fileoverview Usage Examples:
 *
 * // BASIC USAGE - Default export
 * const createConfig = require('release-config');
 *
 * // For npm packages
 * const config = createConfig({ npmPublish: true });
 *
 * // For non-npm projects
 * const config = createConfig({ npmPublish: false });
 *
 * // NAMED EXPORTS - For specific functions
 * const { buildSemanticReleaseConfig, createGitHubWorkflow, validateConfig } = require('release-config');
 *
 * const config = buildSemanticReleaseConfig({
 *   branches: ['main', 'develop'],
 *   npmPublish: true
 * });
 *
 * const workflow = createGitHubWorkflow({
 *   runTests: true,
 *   buildCommand: 'npm run build'
 * });
 *
 * // VALIDATE CONFIGURATION - Check if config is valid
 * const validation = validateConfig(config);
 * if (!validation.isValid) {
 *   console.log('Configuration errors:', validation.errors);
 *   console.log('Warnings:', validation.warnings);
 * }
 * console.log('Configuration summary:', validation.summary);
 *
 * // COMPLETE SETUP - With version updates
 * const {
 *   buildSemanticReleaseConfig,
 *   createUpdateVersionPlugin,
 *   createGitHubWorkflow,
 *   validateConfig
 * } = require('release-config');
 *
 * const versionPlugin = createUpdateVersionPlugin([
 *   { path: 'VERSION.txt', pattern: 'any-regex-pattern', replacement: '${version}' },
 *   { path: 'src/version.js', pattern: 'version-regex-pattern', replacement: 'version: "${version}"' }
 * ]);
 *
 * const config = buildSemanticReleaseConfig({
 *   npmPublish: true,
 *   extraPrepare: [versionPlugin],
 *   gitAssets: ['CHANGELOG.md', 'package.json', 'package-lock.json', 'VERSION.txt', 'src/version.js']
 * });
 *
 * // Validate the configuration before using it
 * const result = validateConfig(config, { verbose: true });
 * if (result.isValid) {
 *   console.log('✅ Configuration is valid!');
 * }
 *
 * const workflow = createGitHubWorkflow({
 *   name: 'CI/CD Pipeline',
 *   runTests: true,
 *   buildCommand: 'npm run build'
 * });
 */
