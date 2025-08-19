/*
 * Shared semantic-release config builder for Clash Strategic repos (internal use)
 */

const path = require('path');

/**
 * Builds a semantic-release configuration object based on provided options.
 */
function buildSemanticReleaseConfig(options = {}) {
  const {
    branches = [
      'main',
      { name: 'beta', prerelease: 'beta' }
    ],
    npmPublish = false,
    gitAssets = ['CHANGELOG.md', 'package.json', 'package-lock.json'],
    gitMessage = 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    extraPrepare = [] // e.g., ['./scripts/update-version.js'] or [['plugin-name', { ... }]]
  } = options;

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
 * Helper function to create update-version plugin configuration.
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
 * Helper function to create GitHub Actions workflow content.
 */
function createGitHubWorkflow(options = {}) {
  const {
    name = 'Release',
    branches = ['main'],
    nodeVersion = 'lts/*',
    runTests = false,
    testCommand = 'npm test',
    buildCommand = null,
    workingDirectory = '.',
    additionalSteps = [],
    permissions = {
      contents: 'write',
      'id-token': 'write',

    }
  } = options;

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

module.exports = buildSemanticReleaseConfig;
module.exports.createUpdateVersionPlugin = createUpdateVersionPlugin;
module.exports.createGitHubWorkflow = createGitHubWorkflow;
