#!/usr/bin/env node

/**
 * CLI tool to validate semantic-release configuration
 * Usage: node validate-config.js [config-file-path]
 */

const path = require('path');
const fs = require('fs');
const { validateConfig } = require('./index.js');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
  console.log(colorize('🔍 Semantic Release Configuration Validator', 'bright'));
  console.log(colorize('=' .repeat(50), 'blue'));
}

function printResult(result, configPath) {
  console.log(colorize(`\n📋 Validating: ${configPath}`, 'cyan'));
  console.log(colorize('-' .repeat(50), 'blue'));

  // Print validation status
  if (result.isValid) {
    console.log(colorize('✅ Configuration is VALID', 'green'));
  } else {
    console.log(colorize('❌ Configuration is INVALID', 'red'));
  }

  // Print errors
  if (result.errors.length > 0) {
    console.log(colorize('\n🚨 ERRORS:', 'red'));
    result.errors.forEach((error, index) => {
      console.log(colorize(`  ${index + 1}. ${error}`, 'red'));
    });
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log(colorize('\n⚠️  WARNINGS:', 'yellow'));
    result.warnings.forEach((warning, index) => {
      console.log(colorize(`  ${index + 1}. ${warning}`, 'yellow'));
    });
  }

  // Print suggestions
  if (result.suggestions.length > 0) {
    console.log(colorize('\n💡 SUGGESTIONS:', 'cyan'));
    result.suggestions.forEach((suggestion, index) => {
      console.log(colorize(`  ${index + 1}. ${suggestion}`, 'cyan'));
    });
  }

  // Print summary
  console.log(colorize('\n📊 SUMMARY:', 'bright'));
  console.log(`  • Valid Structure: ${result.summary.hasValidStructure ? '✅' : '❌'}`);
  console.log(`  • Branches: ${result.summary.branchCount}`);
  console.log(`  • Plugins: ${result.summary.pluginCount}`);
  console.log(`  • NPM Plugin: ${result.summary.hasNpmPlugin ? '✅' : '❌'}`);
  console.log(`  • Git Plugin: ${result.summary.hasGitPlugin ? '✅' : '❌'}`);
  console.log(`  • GitHub Plugin: ${result.summary.hasGitHubPlugin ? '✅' : '❌'}`);
}

function main() {
  printHeader();

  // Get config file path from command line or use default
  const configPath = process.argv[2] || './release.config.js';
  const fullPath = path.resolve(configPath);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(colorize(`\n❌ Configuration file not found: ${fullPath}`, 'red'));
    console.log(colorize('\nUsage: node validate-config.js [config-file-path]', 'yellow'));
    console.log(colorize('Example: node validate-config.js ./release.config.js', 'yellow'));
    process.exit(1);
  }

  try {
    // Load and validate the configuration
    console.log(colorize(`\n📂 Loading configuration from: ${fullPath}`, 'cyan'));
    
    const config = require(fullPath);
    const result = validateConfig(config, { 
      verbose: true, 
      checkPlugins: true 
    });

    printResult(result, configPath);

    // Exit with appropriate code
    if (result.isValid) {
      console.log(colorize('\n🎉 Configuration validation completed successfully!', 'green'));
      process.exit(0);
    } else {
      console.log(colorize('\n💥 Configuration validation failed!', 'red'));
      console.log(colorize('Please fix the errors above and try again.', 'yellow'));
      process.exit(1);
    }

  } catch (error) {
    console.log(colorize(`\n❌ Error loading configuration: ${error.message}`, 'red'));
    
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log(colorize('\n💡 Make sure the configuration file exports a valid object.', 'cyan'));
      console.log(colorize('Example: module.exports = { branches: ["main"], plugins: [...] }', 'cyan'));
    }
    
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error(colorize('\n💥 Unhandled error:', 'red'), error.message);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(colorize('\n💥 Uncaught exception:', 'red'), error.message);
  process.exit(1);
});

// Run the validator
main();
