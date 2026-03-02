const fs = require('fs');
const path = require('path');
const readline = require('readline');
const childProcess = require('child_process');

function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    fs.readdirSync(source).forEach(function(file) {
        var sourcePath = path.join(source, file);
        var targetPath = path.join(target, file);
        var stat = fs.lstatSync(sourcePath);

        if (stat.isDirectory()) {
            copyFolderRecursiveSync(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

function askQuestion(question) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(function(resolve) {
        rl.question(question, function(answer) {
            rl.close();
            resolve(answer);
        });
    });
}

function restartTomcatOnWindows(serviceName) {
    try {
        childProcess.execSync('net stop ' + serviceName, { stdio: 'inherit' });
        childProcess.execSync('net start ' + serviceName, { stdio: 'inherit' });
    } catch (error) {
        throw new Error('Tomcat service restart failed: ' + error.message);
    }
}

async function main() {
    var extensionId = process.argv[2];

    if (!extensionId) {
        console.error('Please specify the extension ID to deploy.');
        console.error('Usage: npm run deploy -- <extension_id>');
        process.exit(1);
    }

    var fullExtensionId = extensionId.indexOf('com.') === 0
        ? extensionId
        : 'com.shimokado.' + extensionId;

    var projectRoot = path.resolve(__dirname, '..');
    var sourceFolder = path.join(projectRoot, fullExtensionId);

    if (!fs.existsSync(sourceFolder)) {
        console.error('Extension folder does not exist: ' + sourceFolder);
        process.exit(1);
    }

    var deployRoot = process.env.WEBFOCUS_EXTENSIONS_DIR ||
        'C:\\ibi\\WebFOCUS93\\config\\web_resource\\extensions';
    var targetFolder = path.join(deployRoot, fullExtensionId);

    console.log('Deploying extension module to WebFOCUS...');
    console.log('Source: ' + sourceFolder);
    console.log('Target: ' + targetFolder);

    copyFolderRecursiveSync(sourceFolder, targetFolder);
    console.log('Deployment completed.');

    if (process.platform === 'win32') {
        var answer = await askQuestion('Do you want to restart Tomcat service now? [y/N] ');
        if (String(answer || '').trim().toLowerCase() === 'y') {
            var serviceName = process.env.WEBFOCUS_TOMCAT_SERVICE || 'Tomcat9WF';
            restartTomcatOnWindows(serviceName);
        }
    }
}

main().catch(function(error) {
    console.error('Deploy failed:', error.message);
    process.exit(1);
});