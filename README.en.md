# WebFOCUS HTML5 Extension Graphs

This is a collection of HTML5 extension graphs for WebFOCUS.

## How to Clone

Clone this repository to your local environment.

## How to Deploy to WebFOCUS

### 1. Add Extensions

Copy the `com.shimokado.extension_name` folder to the WebFOCUS extensions folder:

```
Drive:\ibi\WebFOCUS93\config\web_resource\extensions
```

**WebFOCUS93**: Folder name may vary depending on your version.

### 2. Enable Extensions

Edit the following file to enable the extensions:

```
Drive:\ibi\WebFOCUS93\config\web_resource\extensions\html5chart_extensions.json
```

```json
{
  "com.ibi.existing_extension": {"enabled": true},
  "com.ibi.existing_extension": {"enabled": false},
  "com.ibi.existing_extension": {"enabled": true},
  "com.shimokado.card-simple": { "enabled": true },
  "com.shimokado.table-simple": { "enabled": true }
}
```

This example enables **com.shimokado.card-simple** and **com.shimokado.table-simple**.

### 3. Restart Apache Tomcat

Restart the Apache Tomcat service running WebFOCUS to make the extensions available.

If errors occur, clear your browser cache.

## Customizing Extensions

### Duplicating an Extension

1. Run the `npm run create-extension` command.
2. Modify the icon image and `properties.json` as needed.

### Modifying Rendering

Freely modify the `/* process */` section:

```javascript
function renderCallback(renderConfig) {
	const container = renderConfig.container; // Container
	const data = renderConfig.data; // Data
	const dataBuckets = renderConfig.dataBuckets.buckets; // Data buckets
    const div = document.createElement('div');
    /* Process */
    container.appendChild(div); // Add to container
    renderConfig.renderComplete(); // Call when rendering is complete
}
```

If necessary, load CSS and JS files with **config.resource**.

For other modifications, carefully read the comments in the samples and make the necessary changes.

## Development Guide

Detailed development guides are available in the `development_guide` folder:

- **[00_Overview.md](development_guide/00_Overview.md)**: Development overview
- **[02_API_Reference.md](development_guide/02_API_Reference.md)**: API reference (includes detailed Moonbeam API)
- **[03_Development_Guide.md](development_guide/03_Development_Guide.md)**: Practical implementation guide (data normalization, Moonbeam utilization)
- **[09_IBI_Repository_Findings_Report.md](development_guide/09_IBI_Repository_Findings_Report.md)**: Findings report from IBI official repository

## Contribution Guidelines

We welcome contributions to this project! Bug reports, feature requests, code improvements - all forms of contribution are appreciated.

### Issue Creation Rules

When reporting bugs or requesting features, please follow these guidelines:

#### Bug Reports

When reporting a bug, please include the following information:

1. **Title**: A concise title describing the issue
2. **Environment Information**:
   - WebFOCUS version
   - Browser type and version
   - OS type and version
3. **Steps to Reproduce**: Specific steps to reproduce the issue
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Error Messages**: Any error messages displayed in the console (if applicable)
7. **Screenshots**: Visual representation of the issue (if applicable)

#### Feature Requests

When proposing a new feature, please include:

1. **Title**: A concise title describing the feature
2. **Motivation**: Why this feature is needed
3. **Proposal**: Specifically what the feature should do
4. **Alternatives**: Other possible approaches (if any)
5. **References**: Similar implementations or documentation (if any)

### Pull Request Guidelines

When proposing code changes, please follow these guidelines:

#### Before Creating a PR

1. **Check Issues**: For major changes, discuss in an issue first
2. **Sync with Latest Code**: Pull the latest code from the `main` branch
3. **Local Testing**: Verify that your changes work correctly

#### PR Content

1. **Title**: Concise description of the changes
2. **Description**:
   - What was changed
   - Why it was changed
   - Related issue number (format: `#123`)
3. **Test Results**:
   - How you tested the changes
   - Test environment (browser, WebFOCUS version, etc.)
4. **Screenshots**: Required for UI changes

#### Commit Messages

Write clear and descriptive commit messages:

```
type: Brief description (within 50 characters)

Detailed description (if necessary)
- Reason for change
- Impact scope
- Notes
```

**Type Examples**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (whitespace, formatting, etc.)
- `refactor`: Refactoring
- `test`: Adding or modifying tests
- `chore`: Build process or tool changes

### Coding Standards

To maintain code consistency, please follow these standards:

#### JavaScript

- **Syntax**: Use ES5 syntax (for older browser compatibility)
- **Strict Mode**: Use `'use strict';`
- **Variable Declaration**: Use `var` (don't use `let`/`const`)
- **Indentation**: 4 spaces
- **Semicolons**: Always end statements with semicolons
- **Naming Conventions**:
  - Variables and functions: camelCase (e.g., `myVariable`, `calculateTotal`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_VALUE`)
  - Classes: PascalCase (e.g., `ChartRenderer`)
- **Comments**: Add comments in Japanese or English for complex logic

#### File Structure

- **Extension Folder**: Strictly follow `com.{company}.{extension_id}` format
- **File Name**: Create a JS file with the same name as the extension ID
- **Required Files**: Always include `properties.json` and `test.html`

#### properties.json

- **JSON Format**: 4-space indentation
- **Translations**: Provide both Japanese (`ja`) and English (`en`)
- **Versioning**: Use semantic versioning

### Review Process

1. **Create PR**: Submit a Pull Request
2. **Automated Checks**: CI runs (if configured)
3. **Code Review**: Maintainers review the code
4. **Revisions**: Address feedback as needed
5. **Merge**: Maintainers merge after approval

### Community Code of Conduct

- Communicate with respect
- Provide constructive feedback
- Respect others' opinions
- Maintain an inclusive and welcoming environment

---

## License

This project is published under the [MIT License](LICENSE).

## Contact

If you have questions or suggestions, please create an [Issue](https://github.com/shimokado/webfocus-extensions/issues).
