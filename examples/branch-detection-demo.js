#!/usr/bin/env node

/*
 * Demo script showing how the branch detection now works correctly
 * with custom configurations in release.config.js
 */

const {
  detectUserConfiguration,
  createSmartWorkflow
} = require('../index.js');

console.log('🌿 Branch Detection Demo\n');

// Example 1: Show current configuration detection
console.log('=== Example 1: Current Configuration ===');
const currentConfig = detectUserConfiguration();
console.log('📋 Detected branches:', currentConfig.branches);
console.log('📋 Full config:', JSON.stringify(currentConfig, null, 2));
console.log();

// Example 2: Show how the detection works internally
console.log('=== Example 2: Detection Details ===');
try {
  const releaseConfig = require('../release.config.js');
  console.log('🔧 Semantic-release config branches:', releaseConfig.branches);
  console.log('🔧 Full semantic-release config:');
  console.log(JSON.stringify(releaseConfig, null, 2));
} catch (error) {
  console.log('❌ No semantic-release config found');
}
console.log();

// Example 3: Generate workflow with detected branches
console.log('=== Example 3: Generated Workflow ===');
const workflow = createSmartWorkflow();
const workflowLines = workflow.split('\n');
const branchLine = workflowLines.find(line => line.includes('branches:'));
console.log('🚀 Generated workflow branch configuration:');
console.log(branchLine);
console.log();

// Example 4: Show how different configurations would work
console.log('=== Example 4: Configuration Examples ===');

console.log('💡 To use only main branch:');
console.log('   module.exports = buildConfig({ branches: ["main"] });');
console.log();

console.log('💡 To use main and develop:');
console.log('   module.exports = buildConfig({ branches: ["main", "develop"] });');
console.log();

console.log('💡 To use main with beta prerelease:');
console.log('   module.exports = buildConfig({');
console.log('     branches: ["main", { name: "beta", prerelease: "beta" }]');
console.log('   });');
console.log();

console.log('💡 To use multiple branches with prereleases:');
console.log('   module.exports = buildConfig({');
console.log('     branches: [');
console.log('       "main",');
console.log('       "develop",');
console.log('       { name: "beta", prerelease: "beta" },');
console.log('       { name: "alpha", prerelease: "alpha" }');
console.log('     ]');
console.log('   });');
console.log();

console.log('🎉 The workflow will automatically detect and use your configured branches!');
console.log('📝 Just run: npx setup-release-workflow');
