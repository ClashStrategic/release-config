#!/usr/bin/env node

/*
 * Demo script showing the new smart workflow generation capabilities
 */

const {
  createSmartWorkflow,
  detectUserConfiguration,
  createGitHubWorkflow
} = require('../index.js');

console.log('🤖 Smart Workflow Generation Demo\n');

// Example 1: Auto-detect current project configuration
console.log('=== Example 1: Configuration Auto-Detection ===');
const detectedConfig = detectUserConfiguration();

console.log('📋 Your project configuration:');
console.log(`   🌿 Release branches: ${detectedConfig.branches.join(', ')}`);
console.log(`   📦 Node.js version: ${detectedConfig.nodeVersion}`);
console.log(`   🧪 Run tests: ${detectedConfig.runTests ? 'Yes' : 'No'}`);
if (detectedConfig.testCommand) {
  console.log(`   🔧 Test command: ${detectedConfig.testCommand}`);
}
if (detectedConfig.buildCommand) {
  console.log(`   🏗️ Build command: ${detectedConfig.buildCommand}`);
}
console.log(`   📦 NPM package: ${detectedConfig.isNpmPackage ? 'Yes' : 'No'}`);
if (detectedConfig.additionalScripts.length > 0) {
  console.log(`   ⚙️ Additional scripts: ${detectedConfig.additionalScripts.join(', ')}`);
}
console.log();

// Example 2: Generate smart workflow (recommended approach)
console.log('=== Example 2: Smart Workflow (Recommended) ===');
const smartWorkflow = createSmartWorkflow();
console.log('✨ Generated workflow with auto-detected settings:');
console.log('```yaml');
console.log(smartWorkflow);
console.log('```\n');

// Example 3: Smart workflow with custom overrides
console.log('=== Example 3: Smart Workflow with Overrides ===');
const customWorkflow = createSmartWorkflow({
  name: 'Advanced CI/CD Pipeline',
  additionalSteps: [
    {
      name: 'Security audit',
      run: 'npm audit --audit-level=high'
    },
    {
      name: 'Check bundle size',
      run: 'npm run size-check || echo "No size-check script found"'
    }
  ]
});
console.log('🎯 Generated workflow with custom steps:');
console.log('```yaml');
console.log(customWorkflow.split('\n').slice(0, 20).join('\n'));
console.log('... (truncated for demo)');
console.log('```\n');

// Example 4: Manual configuration (for comparison)
console.log('=== Example 4: Manual Configuration (Old Way) ===');
const manualWorkflow = createGitHubWorkflow({
  autoDetect: false, // Disable auto-detection
  name: 'Manual Release',
  branches: ['main'],
  nodeVersion: '18',
  runTests: false,
  buildCommand: null
});
console.log('⚙️ Generated workflow with manual settings:');
console.log('```yaml');
console.log(manualWorkflow.split('\n').slice(0, 15).join('\n'));
console.log('... (truncated for demo)');
console.log('```\n');

console.log('🎉 Demo completed!');
console.log('\n💡 To use in your project:');
console.log('   npx setup-release-workflow');
console.log('   or');
console.log('   const workflow = createSmartWorkflow();');
