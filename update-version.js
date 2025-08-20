const fs = require('fs');
const path = require('path');

/**
 * Versatile semantic-release plugin to update version and datetime in any files
 * using configurable regex patterns.
 */
module.exports = {
  prepare: async (pluginConfig, context) => {
    const { nextRelease, logger, cwd } = context;
    const version = nextRelease.version;

    // Default datetime format (ISO UTC)
    const datetimeFormat = pluginConfig.datetimeFormat || 'iso';
    const datetime = getFormattedDatetime(datetimeFormat);

    // Validate configuration
    if (!pluginConfig.files || !Array.isArray(pluginConfig.files)) {
      throw new Error('update-version plugin requires "files" array in configuration');
    }

    const results = [];

    for (const fileConfig of pluginConfig.files) {
      try {
        const result = await updateFile(fileConfig, version, datetime, cwd, logger);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to update file ${fileConfig.path}:`, error.message);
        throw error;
      }
    }

    // Log summary
    logger.log('✅ Version update completed successfully:');
    logger.log(`  VERSION: ${version}`);
    logger.log(`  DATETIME: ${datetime}`);
    results.forEach(result => {
      logger.log(`  Updated: ${result.path} (${result.replacements} replacements)`);
    });
  }
};

async function updateFile(fileConfig, version, datetime, cwd, logger) {
  const { path: filePath, patterns, pattern, replacement } = fileConfig;

  if (!filePath) {
    throw new Error('File configuration must include "path"');
  }

  // Support both formats:
  // 1. New format: { path, patterns: [{ regex, replacement }] }
  // 2. Simple format: { path, pattern, replacement } (from JSDoc)
  let patternsToProcess = [];

  if (patterns && Array.isArray(patterns)) {
    // New format with patterns array
    patternsToProcess = patterns;
  } else if (pattern && replacement) {
    // Simple format from JSDoc - convert to new format
    patternsToProcess = [{
      regex: pattern,
      replacement: replacement
    }];
  } else {
    throw new Error(`File ${filePath} must include either "patterns" array or "pattern" and "replacement" properties`);
  }

  const fullPath = path.resolve(cwd || process.cwd(), filePath);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let replacements = 0;

  for (const patternObj of patternsToProcess) {
    const { regex, replacement: repl } = patternObj;

    if (!regex || !repl) {
      throw new Error(`Pattern must include both "regex" and "replacement" for file ${filePath}`);
    }

    // Convert string regex to RegExp if needed
    const regexObj = typeof regex === 'string' ? new RegExp(regex, 'g') : regex;

    // Replace variables in replacement string
    const finalReplacement = repl
      .replace(/\{version\}/g, version)
      .replace(/\{datetime\}/g, datetime)
      // Also support ${version} and ${date} for backward compatibility
      .replace(/\$\{version\}/g, version)
      .replace(/\$\{date\}/g, datetime);

    const originalContent = content;
    content = content.replace(regexObj, finalReplacement);

    if (content !== originalContent) {
      replacements++;
    } else {
      throw new Error(`Pattern did not match any content in ${filePath}: ${regexObj}`);
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');

  return {
    path: filePath,
    replacements
  };
}

function getFormattedDatetime(format) {
  const now = new Date();

  switch (format) {
    case 'iso':
    default:
      return now.toISOString();
    case 'unix':
      return Math.floor(now.getTime() / 1000).toString();
    case 'custom':
      // Could be extended for custom formats
      return now.toISOString();
  }
}
