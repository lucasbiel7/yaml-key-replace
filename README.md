# YAML Key Replace

[![CI](https://github.com/lucasbiel7/yaml-key-replace/actions/workflows/ci.yml/badge.svg)](https://github.com/lucasbiel7/yaml-key-replace/actions/workflows/ci.yml)
[![Publish](https://github.com/lucasbiel7/yaml-key-replace/actions/workflows/publish.yml/badge.svg)](https://github.com/lucasbiel7/yaml-key-replace/actions/workflows/publish.yml)
[![VS Code Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/lucasbiel7.yaml-key-replace?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=lucasbiel7.yaml-key-replace)
[![Open VSX Version](https://img.shields.io/open-vsx/v/lucasbiel7/yaml-key-replace?label=Open%20VSX)](https://open-vsx.org/extension/lucasbiel7/yaml-key-replace)
[![License](https://img.shields.io/github/license/lucasbiel7/yaml-key-replace)](https://github.com/lucasbiel7/yaml-key-replace/blob/main/LICENSE)

A VS Code extension that provides IntelliJ-like behavior for pasting and copying YAML properties. When you paste a dotted key path (like `listing.api.endpoint`) into a YAML file, it automatically expands to proper YAML structure with correct indentation. When copying a YAML property, it converts it back to a flattened key path.

## Features

### Smart Paste
- **Paste dotted keys**: Copy `listing.api.endpoint` and paste it in a YAML file to get:
  ```yaml
  listing:
    api:
      endpoint:
  ```
- **Auto-indentation**: Uses your editor's configured indentation (spaces or tabs)
- **Navigate to existing**: If the property already exists, the cursor jumps to it instead of duplicating
- **Fallback to normal paste**: If the clipboard doesn't contain a valid key path, normal paste behavior is used

### Smart Copy
- **Copy as flattened path**: When you copy a YAML property (with cursor on the key), it copies the flattened path like `listing.api.endpoint`
- **Smart detection**: Only converts to key path when copying the property itself, not just the value
- **Fallback to normal copy**: If not copying a property, normal copy behavior is used

## Usage

### Pasting Keys

1. Copy a dotted key path to your clipboard (e.g., `server.port`)
2. Open a YAML file (`.yml` or `.yaml`)
3. Position your cursor where you want to insert the property
4. Press `Cmd+V` (Mac) or `Ctrl+V` (Windows/Linux)
5. The key expands to proper YAML structure:
   ```yaml
   server:
     port:
   ```

**If the property already exists:**
- The extension will navigate to the existing property
- A message will show: "Property 'server.port' already exists. Navigated to it."
- No duplicate properties are created

### Copying Keys

1. Open a YAML file
2. Place your cursor on a property key (or select it)
3. Press `Cmd+C` (Mac) or `Ctrl+C` (Windows/Linux)
4. The flattened key path is copied to your clipboard (e.g., `server.port`)

**Example:**
```yaml
server:
  port: 8080  # Cursor here, copy gives you "server.port"
  host: localhost
```

## Requirements

- VS Code 1.93.1 or higher
- YAML files (`.yml` or `.yaml`)

## Installation

### From Extension Marketplaces

#### VS Code
1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Search for "YAML Key Replace"
4. Click Install

Or install directly from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=lucasbiel7.yaml-key-replace)

#### Cursor, VSCodium, and Other VS Code-based Editors
1. Open your editor
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Search for "YAML Key Replace"
4. Click Install

Or install directly from [Open VSX Registry](https://open-vsx.org/extension/lucasbiel7/yaml-key-replace)

### From VSIX File
Download the `.vsix` file from [Releases](https://github.com/lucasbiel7/yaml-key-replace/releases) and install via:
```bash
code --install-extension yaml-key-replace-0.0.3.vsix
# or
cursor --install-extension yaml-key-replace-0.0.3.vsix
```

### From Source (Development)

1. Clone or download this repository
2. Open the folder in VS Code
3. Run `npm install` to install dependencies
4. Press `F5` to launch the Extension Development Host
5. Open a YAML file in the new window to test

### Building and Installing Locally

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package the extension
npm run package

# Install in Cursor/VS Code
cursor --install-extension yaml-key-replace-0.0.3.vsix
# or
code --install-extension yaml-key-replace-0.0.3.vsix
```

## How It Works

### Indentation Detection
The extension respects your editor's indentation settings:
- Reads `editor.insertSpaces` and `editor.tabSize` from your configuration
- Uses spaces or tabs based on your settings
- Maintains the base indentation of the line where you paste

### Key Path Validation
Valid key paths must:
- Contain only alphanumeric characters, underscores, and hyphens
- Use dots (`.`) as separators
- Not start or end with a dot
- Not have consecutive dots

Examples:
- ✅ Valid: `a`, `a.b`, `listing.api.endpoint`, `server-config.port_number`
- ❌ Invalid: `a.`, `.b`, `a..b`, `a b` (spaces), `a/b` (slashes)

### YAML Parsing
- Uses the `yaml` library for robust parsing
- Tracks line and column positions accurately
- Handles nested structures correctly
- Only supports YAML mappings (objects) - arrays are not expanded

## Configuration

### Available Settings

Access settings via: **Settings → Extensions → YAML Key Replace** or edit your `settings.json` file directly.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `yamlKeyReplace.logLevel` | string | `"info"` | Log level for extension output: `error`, `warn`, `info`, `debug`, or `trace`. Use `debug` or `trace` for troubleshooting. |

### Log Level Configuration

Control extension logging verbosity:

```json
{
  "yamlKeyReplace.logLevel": "info"  // Options: error, warn, info, debug, trace
}
```

Use `debug` or `trace` when troubleshooting issues:

```json
{
  "yamlKeyReplace.logLevel": "debug"  // Enables detailed logging
}
```

**Log Levels:**
- **error**: Only critical errors
- **warn**: Warnings + errors
- **info**: General info + warnings + errors (default)
- **debug**: Detailed debug info (recommended for troubleshooting)
- **trace**: Very detailed step-by-step execution

View logs in the **Debug Console** when running the Extension Development Host.

### Default Behavior

The extension automatically:
- Activates when you open YAML files
- Activates when a contributed command is executed (e.g., via keybindings)
- Uses your editor's indentation settings
- Works only in YAML language mode

## Keybindings

The extension overrides the default copy/paste behavior **only in YAML files**:

| Command | Mac | Windows/Linux | When |
|---------|-----|---------------|------|
| Paste Key Path | `Cmd+V` | `Ctrl+V` | In YAML files |
| Copy Key Path | `Cmd+C` | `Ctrl+C` | In YAML files |

In other file types, normal copy/paste behavior is preserved.

## Development

### Project Structure
```
yaml-key-replace/
├── src/
│   ├── extension.ts           # Main entry point
│   ├── commands/
│   │   ├── pasteKeyPath.ts    # Paste command implementation
│   │   └── copyKeyPath.ts     # Copy command implementation
│   └── yaml/
│       ├── keyPath.ts         # Key path validation and parsing
│       └── yamlAst.ts         # YAML AST navigation utilities
├── package.json               # Extension manifest
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

### Building
```bash
# Install dependencies
npm install

# Compile TypeScript (watch mode)
npm run watch

# Compile once
npm run compile

# Lint
npm run lint
```

### Testing
1. Press `F5` in VS Code to launch Extension Development Host
2. Open a YAML file
3. Test paste with dotted keys like `a.b.c`
4. Test copy on YAML properties

### Debugging
- Set breakpoints in TypeScript files
- Use `F5` to start debugging
- Check the Debug Console for logs

## Known Limitations

- Only supports YAML mappings (objects), not arrays/sequences
- Key paths must use dots as separators (no other formats supported)
- Requires valid YAML syntax for copy to work correctly

## License

MIT

## Credits

Inspired by IntelliJ IDEA's YAML property paste behavior.

---

**Enjoy using YAML Key Replace!**

If you find this extension helpful, please star the repository and share it with others.
