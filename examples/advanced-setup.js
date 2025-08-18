#!/usr/bin/env node

/*
 * Example: Advanced setup with custom workflow and semantic-release config
 */

const { createGitHubWorkflow, setupWorkflow } = require('../index.js');
const buildConfig = require('../index.js');
const fs = require('fs');

// Example 1: Generate workflow content with custom options
console.log('=== Example 1: Custom Workflow Content ===');
const customWorkflow = createGitHubWorkflow({
  name: 'Advanced Release Pipeline',
  branches: ['main', 'develop'],
  nodeVersion: '20',
  runTests: true,
  testCommand: 'npm run test:ci',
  buildCommand: 'npm run build',
  additionalSteps: [
    {
      name: 'Run linting',
      run: 'npm run lint'
    },
    {
      name: 'Upload coverage',
      uses: 'codecov/codecov-action@v3',
      with: {
        file: './coverage/lcov.info'
      }
    },
    {
      name: 'Deploy to staging',
      run: 'npm run deploy:staging',
      env: {
        DEPLOY_ENV: 'staging',
        API_KEY: '${{ secrets.STAGING_API_KEY }}'
      }
    }
  ]
});

console.log('Generated workflow:');
console.log(customWorkflow);
console.log('\n');

// Example 2: Complete semantic-release config with update-version plugin
console.log('=== Example 2: Complete Release Config ===');
const { createUpdateVersionPlugin } = require('../index.js');

const updateVersionPlugin = createUpdateVersionPlugin([
  {
    path: 'src/version.php',
    patterns: [
      {
        regex: /(const VERSION = ').*?(')/,
        replacement: '$1{version}$2'
      },
      {
        regex: /(const BUILD_DATE = ').*?(')/,
        replacement: '$1{datetime}$2'
      }
    ]
  },
  {
    path: 'package.json',
    patterns: [
      {
        regex: /("version":\s*").*?(")/,
        replacement: '$1{version}$2'
      }
    ]
  }
]);

const releaseConfig = buildConfig({
  npmPublish: false,
  gitAssets: ['CHANGELOG.md', 'package.json', 'src/version.php'],
  extraPrepare: [updateVersionPlugin],
  gitMessage: '🚀 Release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
});

console.log('Release config:');
console.log(JSON.stringify(releaseConfig, null, 2));
console.log('\n');

// Example 3: Setup workflow programmatically (commented out to avoid creating files)
console.log('=== Example 3: Programmatic Setup ===');
console.log('This would create the workflow file:');
console.log('setupWorkflow({ name: "My Custom Release", runTests: true });');
