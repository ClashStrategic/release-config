#!/usr/bin/env node

/*
 * Setup script to create GitHub Actions workflow for semantic-release
 */

const fs = require('fs');
const path = require('path');
const { createGitHubWorkflow } = require('./index.js');

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

  // Generate workflow content
  const workflowContent = createGitHubWorkflow(options);

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

  // For now, use defaults. In the future, we could add prompts here
  const options = {
    name: 'Release',
    branches: ['main'],
    nodeVersion: '18',
    runTests: false
  };

  try {
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
