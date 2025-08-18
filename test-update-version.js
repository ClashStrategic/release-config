const updateVersionPlugin = require('./update-version.js');
const fs = require('fs');
const path = require('path');

// Create a test file for testing
const testFilePath = path.join(__dirname, 'test-file.txt');
const testContent = `
class TestClass {
  private string $VERSION = "0.0.0";
  private string $DATETIME_VERSION = "1970-01-01T00:00:00.000Z";
  
  public function getInfo() {
    return "Version: " . $this->VERSION;
  }
}
`;

const mockContext = {
  nextRelease: {
    version: '2.1.0-test-versatile'
  },
  logger: {
    log: (message) => console.log(`[Test Logger] ${message}`),
    error: (message) => console.error(`[Test Logger ERROR] ${message}`)
  },
  cwd: __dirname
};

const testConfig = {
  files: [
    {
      path: 'test-file.txt',
      patterns: [
        {
          regex: /(private string \$VERSION = \").*?(\";)/,
          replacement: '$1{version}$2'
        },
        {
          regex: /(private string \$DATETIME_VERSION = \").*?(\";)/,
          replacement: '$1{datetime}$2'
        }
      ]
    }
  ]
};

async function runTest() {
  try {
    // Create test file
    fs.writeFileSync(testFilePath, testContent, 'utf8');
    console.log('✅ Test file created');

    // Run the plugin
    await updateVersionPlugin.prepare(testConfig, mockContext);
    
    // Verify results
    const updatedContent = fs.readFileSync(testFilePath, 'utf8');
    console.log('\n📄 Updated content:');
    console.log(updatedContent);
    
    // Verify version was updated
    if (updatedContent.includes('2.1.0-test-versatile')) {
      console.log('✅ Version updated correctly');
    } else {
      throw new Error('Version was not updated');
    }
    
    // Verify datetime was updated (should not be the original)
    if (!updatedContent.includes('1970-01-01T00:00:00.000Z')) {
      console.log('✅ Datetime updated correctly');
    } else {
      throw new Error('Datetime was not updated');
    }
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('🧹 Test file cleaned up');
    }
  }
}

// Test error cases
async function testErrorCases() {
  console.log('\n🧪 Testing error cases...');
  
  // Test missing files config
  try {
    await updateVersionPlugin.prepare({}, mockContext);
    throw new Error('Should have failed with missing files config');
  } catch (error) {
    if (error.message.includes('requires "files" array')) {
      console.log('✅ Correctly handles missing files config');
    } else {
      throw error;
    }
  }
  
  // Test non-existent file
  try {
    await updateVersionPlugin.prepare({
      files: [{ path: 'non-existent.txt', patterns: [] }]
    }, mockContext);
    throw new Error('Should have failed with non-existent file');
  } catch (error) {
    if (error.message.includes('File not found')) {
      console.log('✅ Correctly handles non-existent file');
    } else {
      throw error;
    }
  }
}

async function runAllTests() {
  await runTest();
  await testErrorCases();
  console.log('\n🏆 All tests completed successfully!');
}

runAllTests();
