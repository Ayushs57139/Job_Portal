#!/usr/bin/env node

/**
 * Test Runner Script
 * Runs all tests and generates a comprehensive error report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Comprehensive Test Suite...\n');
console.log('='.repeat(60));

const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  errors: [],
  warnings: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

function runTest(testFile) {
  try {
    console.log(`\n📋 Running: ${testFile}`);
    const output = execSync(`npx jest ${testFile} --verbose --no-coverage`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: __dirname + '/..'
    });
    
    testResults.tests.push({
      file: testFile,
      status: 'passed',
      output: output
    });
    testResults.summary.passed++;
    console.log(`✅ PASSED: ${testFile}`);
    return true;
  } catch (error) {
    const errorOutput = error.stdout || error.stderr || error.message;
    testResults.tests.push({
      file: testFile,
      status: 'failed',
      error: errorOutput
    });
    testResults.errors.push({
      file: testFile,
      error: errorOutput
    });
    testResults.summary.failed++;
    console.log(`❌ FAILED: ${testFile}`);
    console.log(`Error: ${errorOutput.substring(0, 200)}...`);
    return false;
  }
}

// Run all test files
const testFiles = [
  'tests/health.test.js',
  'tests/database.test.js',
  'tests/auth.test.js',
  'tests/jobs.test.js',
  'tests/applications.test.js',
  'tests/admin.test.js',
  'tests/integration.test.js'
];

testFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    testResults.summary.total++;
    runTest(file);
  } else {
    testResults.warnings.push(`Test file not found: ${file}`);
    console.log(`⚠️  WARNING: Test file not found: ${file}`);
  }
});

// Generate report
console.log('\n' + '='.repeat(60));
console.log('\n📊 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${testResults.summary.total}`);
console.log(`✅ Passed: ${testResults.summary.passed}`);
console.log(`❌ Failed: ${testResults.summary.failed}`);
console.log(`⏭️  Skipped: ${testResults.summary.skipped}`);

// Write detailed report to file
const reportPath = path.join(__dirname, '..', 'test-report.json');
fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// Generate HTML report
const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${new Date().toLocaleString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #333; color: white; padding: 20px; }
        .summary { margin: 20px 0; }
        .passed { color: green; }
        .failed { color: red; }
        .error { background: #ffe6e6; padding: 10px; margin: 10px 0; border-left: 4px solid red; }
        .warning { background: #fff3cd; padding: 10px; margin: 10px 0; border-left: 4px solid orange; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Report</h1>
        <p>Generated: ${testResults.timestamp}</p>
    </div>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total: ${testResults.summary.total}</p>
        <p class="passed">Passed: ${testResults.summary.passed}</p>
        <p class="failed">Failed: ${testResults.summary.failed}</p>
    </div>
    <h2>Errors</h2>
    ${testResults.errors.map(e => `
        <div class="error">
            <h3>${e.file}</h3>
            <pre>${e.error.substring(0, 1000)}</pre>
        </div>
    `).join('')}
    <h2>Warnings</h2>
    ${testResults.warnings.map(w => `<div class="warning">${w}</div>`).join('')}
</body>
</html>
`;

const htmlReportPath = path.join(__dirname, '..', 'test-report.html');
fs.writeFileSync(htmlReportPath, htmlReport);
console.log(`📄 HTML report saved to: ${htmlReportPath}`);

// Exit with error code if tests failed
if (testResults.summary.failed > 0) {
  console.log('\n❌ Some tests failed. Please review the errors above.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}

