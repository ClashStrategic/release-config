#!/usr/bin/env node

/*
 * Setup script to create GitHub Actions workflow for semantic-release
 */

const fs = require('fs');
const path = require('path');
const { createSmartWorkflow, detectUserConfiguration } = require('./index.js');

/**
 * Creates the .github/workflows directory and release.yml file
 */
function setupWorkflow(options = {}) {
  const workflowDir = path.join(process.cwd(), '.github', 'workflows');
  const workflowFile = path.join(workflowDir, 'release.yml');

  // Create directories if they don't exist
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
    console.log('✅ Created .github/workflows directory');
  }

  // Generate workflow content using smart defaults
  const workflowContent = createSmartWorkflow(options);

  // Write workflow file
  fs.writeFileSync(workflowFile, workflowContent);
  console.log('✅ Created .github/workflows/release.yml');

  return workflowFile;
}

/**
 * Interactive setup when run as CLI
 */
function interactiveSetup() {
  console.log('🚀 Setting up GitHub Actions workflow for semantic-release...\n');

  try {
    // Auto-detect current project configuration
    console.log('🔍 Analyzing your project configuration...');
    const detectedConfig = detectUserConfiguration();

    console.log('\n📋 Detected configuration:');
    console.log(`   • Branches: ${detectedConfig.branches.join(', ')}`);
    console.log(`   • Node.js version: ${detectedConfig.nodeVersion}`);
    console.log(`   • Run tests: ${detectedConfig.runTests ? 'Yes' : 'No'}`);
    if (detectedConfig.testCommand) {
      console.log(`   • Test command: ${detectedConfig.testCommand}`);
    }
    if (detectedConfig.buildCommand) {
      console.log(`   • Build command: ${detectedConfig.buildCommand}`);
    }
    if (detectedConfig.additionalScripts.length > 0) {
      console.log(`   • Additional scripts found: ${detectedConfig.additionalScripts.join(', ')}`);
    }
    console.log(`   • NPM package: ${detectedConfig.isNpmPackage ? 'Yes' : 'No'}`);

    // Use auto-detected configuration (createGitHubWorkflow will auto-detect by default)
    const options = {
      name: 'Release'
      // Let createGitHubWorkflow auto-detect everything else
    };

    const workflowFile = setupWorkflow(options);

    console.log('\n🎉 Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Commit and push your changes');
    console.log('2. Make sure your repository has "Read and write permissions" for GitHub Actions');
    console.log('3. Push a commit with conventional format (feat:, fix:, etc.) to trigger a release');
    console.log('\nWorkflow created at:', workflowFile);

  } catch (error) {
    console.error('❌ Error setting up workflow:', error.message);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { setupWorkflow };

// Run interactively if called directly
if (require.main === module) {
  interactiveSetup();
}
