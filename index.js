/*
 * Shared semantic-release config builder for Clash Strategic repos (internal use)
 */

const path = require('path');

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

// Helper function to create update-version plugin configuration
function createUpdateVersionPlugin(files, datetimeFormat = 'iso') {
  return [
    path.join(__dirname, 'update-version.js'),
    {
      files,
      datetimeFormat
    }
  ];
}

module.exports = buildSemanticReleaseConfig;
module.exports.createUpdateVersionPlugin = createUpdateVersionPlugin;

