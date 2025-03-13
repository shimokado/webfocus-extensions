const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 行を読み取るためのインターフェースを作成
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * 指定されたソースフォルダの内容を再帰的にターゲットフォルダにコピーします。
 * ターゲットフォルダが存在しない場合は作成されます。
 *
 * @param {string} source - コピー元のフォルダのパス。
 * @param {string} target - コピー先のフォルダのパス。
 */
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

/**
 * 指定されたJavaScriptファイルの内容を更新します。
 *
 * @param {string} filePath - 更新するファイルのパス。
 * @param {string} newId - 新しいID。
 * @param {string} oldTemplateId - 置き換える古いテンプレートID。
 * @throws {Error} ファイルの読み込みまたは書き込みに失敗した場合にスローされます。
 */
function updateJsFile(filePath, newId, oldTemplateId) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace config.id value
    content = content.replace(/config\.id\s*=\\s*['"].*?['"]/, `config.id = '${newId}'`);
    // Replace all occurrences of old template id with new id
    content = content.replace(new RegExp(oldTemplateId, 'g'), newId);
    fs.writeFileSync(filePath, content);
}

/**
 * 拡張機能を作成する非同期関数。
 * ユーザーに拡張機能IDとコンテナタイプを尋ね、それに基づいてテンプレートフォルダをコピーし、
 * 必要なファイルのリネームと更新を行います。
 * 
 * @async
 * @function createExtension
 * @returns {Promise<void>} プロミスが解決されると、拡張機能が正常に作成されたことを示します。
 * @throws {Error} 拡張機能の作成中にエラーが発生した場合にスローされます。
 */
async function createExtension() {
    try {
        // Ask for company name
        const companyName = await new Promise(resolve => {
            rl.question('Enter company name: ', answer => {
                resolve(answer.trim());
            });
        });

        // Validate company name
        if (!companyName) {
            throw new Error('Company name cannot be empty!');
        }

        // Validate company name
        if (!/^[a-z0-9_]+$/.test(companyName)) {
            throw new Error('Company name must contain only lowercase alphanumeric characters and underscores!');
        }

        // Ask for extension ID
        const extensionId = await new Promise(resolve => {
            rl.question(`Enter extension ID (will be prefixed with com.${companyName}.): `, answer => {
                resolve(answer.trim());
            });
        });

        // Validate extension ID
        if (!extensionId) {
            throw new Error('Extension ID cannot be empty!');
        }
        // Validate extension ID
        if (!/^[a-z0-9_]+$/.test(extensionId)) {
            throw new Error('Extension ID must contain only lowercase alphanumeric characters and underscores!');
        }

        // Ask for container type number（1. d3.js, 2. chart.js, 3. html）
        const containerType = await new Promise(resolve => {
            rl.question('Enter container type (1. d3.js, 2. chart.js, 3. html): ', answer => {
                resolve(answer.trim());
            });
        });

        // Validate container type
        if (!['1', '2', '3'].includes(containerType)) {
            console.error('Invalid container type!');
            process.exit(1);
        }

        const newFolderName = `com.${companyName}.${extensionId}`;
    
        const templateFolder = containerType === '1' ? 'com.shimokado.base_chart' : containerType === '2' ? 'com.shimokado.chartjs_sample' : 'com.shimokado.params';

        // Copy template folder
        const sourceDir = path.join(__dirname, '..', templateFolder);
        const targetDir = path.join(__dirname, '..', newFolderName);

        if (fs.existsSync(targetDir)) {
            console.error(`Extension ${newFolderName} already exists!`);
            process.exit(1);
        }

        copyFolderRecursiveSync(sourceDir, targetDir);

        // Rename JS file
        const oldJsFile = path.join(targetDir, `${templateFolder}.js`); 
        const newJsFile = path.join(targetDir, `${newFolderName}.js`);

        if (fs.existsSync(oldJsFile)) {
            fs.renameSync(oldJsFile, newJsFile);
            updateJsFile(newJsFile, newFolderName, templateFolder);
        }

        const testHtmlFile = path.join(targetDir, 'test.html');
        if (fs.existsSync(testHtmlFile)) {
            updateJsFile(testHtmlFile, newFolderName, templateFolder);
        }

        console.log(`Successfully created extension: ${newFolderName}`);
    } catch (error) {
        console.error('Error creating extension:', error);
    } finally {
        rl.close();
    }
}

createExtension();