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
 * Creates a complete GitHub Actions workflow for semantic-release.
 *
 * This function generates a ready-to-use GitHub Actions workflow YAML content
 * that can be saved to .github/workflows/release.yml in your repository.
 *
 * @param {Object} [options={}] - Workflow configuration options
 * @param {string} [options.name='Release'] - Name of the GitHub Actions workflow
 * @param {Array<string>|string} [options.branches=['main']] - Branches that trigger the release workflow
 * @param {string} [options.nodeVersion='lts/*'] - Node.js version to use (e.g., '18', 'lts/*', '20.x')
 * @param {boolean} [options.runTests=false] - Whether to run tests before releasing
 * @param {string} [options.testCommand='npm test'] - Command to run tests
 * @param {string|null} [options.buildCommand=null] - Optional build command to run before release
 * @param {Array<Object|string>} [options.additionalSteps=[]] - Custom steps to add before release
 * @param {Object} [options.permissions] - GitHub token permissions for the workflow
 *
 * @returns {string} Complete GitHub Actions workflow YAML content
 *
 * @example
 * // Basic workflow for main branch
 * const workflow = createGitHubWorkflow();
 *
 * @example
 * // Workflow with tests and build step
 * const workflow = createGitHubWorkflow({
 *   name: 'CI/CD Release',
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

  const {
    name = 'Release',
    branches = ['main'],
    nodeVersion = 'lts/*',
    runTests = false,
    testCommand = 'npm test',
    buildCommand = null,
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
${steps.join('\n')}`;

  return workflow;
}

// Export the main function as default export for simple usage
module.exports = buildSemanticReleaseConfig;

// Export all functions for flexibility
module.exports.buildSemanticReleaseConfig = buildSemanticReleaseConfig;
module.exports.createUpdateVersionPlugin = createUpdateVersionPlugin;
module.exports.createGitHubWorkflow = createGitHubWorkflow;

/**
 * @fileoverview Usage Examples:
 *
 * // BASIC USAGE - Default export
 * const createConfig = require('shared-semantic-config');
 *
 * // For npm packages
 * const config = createConfig({ npmPublish: true });
 *
 * // For non-npm projects
 * const config = createConfig({ npmPublish: false });
 *
 * // NAMED EXPORTS - For specific functions
 * const { buildSemanticReleaseConfig, createGitHubWorkflow } = require('shared-semantic-config');
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
 * // COMPLETE SETUP - With version updates
 * const {
 *   buildSemanticReleaseConfig,
 *   createUpdateVersionPlugin,
 *   createGitHubWorkflow
 * } = require('shared-semantic-config');
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
 * const workflow = createGitHubWorkflow({
 *   name: 'CI/CD Pipeline',
 *   runTests: true,
 *   buildCommand: 'npm run build'
 * });
 */
