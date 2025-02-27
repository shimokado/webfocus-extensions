const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function copyFolderRecursiveSync(source, target) {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    // Read source directory
    const files = fs.readdirSync(source);

    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        if (fs.lstatSync(sourcePath).isDirectory()) {
            copyFolderRecursiveSync(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

function updateJsFile(filePath, newId, oldTemplateId) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace config.id value
    content = content.replace(/config\.id\s*=\\s*['"].*?['"]/, `config.id = '${newId}'`);
    // Replace all occurrences of old template id with new id
    content = content.replace(new RegExp(oldTemplateId, 'g'), newId);
    fs.writeFileSync(filePath, content);
}

async function createExtension() {
    try {
        // Ask for extension ID
        const extensionId = await new Promise(resolve => {
            rl.question('Enter extension ID (will be prefixed with com.shimokado.): ', answer => {
                resolve(answer.trim());
            });
        });

        // Ask for container type
        const containerType = await new Promise(resolve => {
            rl.question('Select container type (svg/html): ', answer => {
                resolve(answer.trim().toLowerCase());
            });
        });

        if (!['svg', 'html'].includes(containerType)) {
            console.error('Invalid container type. Please specify either "svg" or "html".');
            process.exit(1);
        }

        const newFolderName = `com.shimokado.${extensionId}`;
        const templateFolder = containerType === 'svg' 
            ? 'com.shimokado.simple_bar'
            : 'com.shimokado.params';

        // Copy template folder
        const sourceDir = path.join(__dirname, '..', templateFolder);
        const targetDir = path.join(__dirname, '..', newFolderName);

        if (fs.existsSync(targetDir)) {
            console.error(`Extension ${newFolderName} already exists!`);
            process.exit(1);
        }

        copyFolderRecursiveSync(sourceDir, targetDir);

        // Rename JS file
        const oldJsFile = path.join(targetDir, containerType === 'svg' ? 'com.shimokado.simple_bar.js' : 'com.shimokado.params.js');
        const newJsFile = path.join(targetDir, `${newFolderName}.js`);

        if (fs.existsSync(oldJsFile)) {
            fs.renameSync(oldJsFile, newJsFile);
            updateJsFile(newJsFile, newFolderName, templateFolder);
        }

        console.log(`Successfully created extension: ${newFolderName}`);
    } catch (error) {
        console.error('Error creating extension:', error);
    } finally {
        rl.close();
    }
}

createExtension();