const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

function openFile(filePath) {
    var platform = process.platform;

    if (platform === 'win32') {
        childProcess.spawn('cmd', ['/c', 'start', '', filePath], {
            detached: true,
            stdio: 'ignore'
        }).unref();
        return;
    }

    if (platform === 'darwin') {
        childProcess.spawn('open', [filePath], { stdio: 'ignore', detached: true }).unref();
        return;
    }

    childProcess.spawn('xdg-open', [filePath], { stdio: 'ignore', detached: true }).unref();
}

function main() {
    var extensionId = process.argv[2];

    if (!extensionId) {
        console.error('Please specify the extension ID to test.');
        console.error('Usage: npm run test -- <extension_id>');
        process.exit(1);
    }

    var fullExtensionId = extensionId.indexOf('com.') === 0
        ? extensionId
        : 'com.shimokado.' + extensionId;

    var projectRoot = path.resolve(__dirname, '..');
    var testFile = path.join(projectRoot, fullExtensionId, 'test.html');

    if (!fs.existsSync(testFile)) {
        console.error('Test file not found: ' + testFile);
        process.exit(1);
    }

    console.log('Opening test file: ' + testFile);
    openFile(testFile);
}

main();