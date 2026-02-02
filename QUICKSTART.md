# Quick Start Guide

## Testing the Extension

### 1. Launch Extension Development Host

1. Open this project in VS Code/Cursor
2. Press `F5` to launch the Extension Development Host
3. A new window will open with the extension loaded

### 2. Test Paste Functionality

1. In the new window, open `example.yaml` (or create a new `.yaml` file)
2. Copy this text to your clipboard: `listing.api.endpoint`
3. Position your cursor in the YAML file
4. Press `Cmd+V` (Mac) or `Ctrl+V` (Windows/Linux)
5. You should see:
   ```yaml
   listing:
     api:
       endpoint:
   ```

### 3. Test Navigation to Existing Key

1. Copy `server.port` to your clipboard
2. Paste it anywhere in `example.yaml`
3. You should see a message: "Property 'server.port' already exists. Navigated to it."
4. The cursor should jump to the existing `port` key under `server`

### 4. Test Copy Functionality

1. In `example.yaml`, place your cursor on the word `username` (line 12)
2. Press `Cmd+C` (Mac) or `Ctrl+C` (Windows/Linux)
3. You should see a message: "Copied: database.credentials.username"
4. Paste somewhere to verify: you should get `database.credentials.username`

### 5. Test Fallback Behavior

**Paste non-key text:**
1. Copy some regular text: `Hello World`
2. Paste in the YAML file
3. It should paste normally (not expand)

**Copy a value:**
1. Select the value `localhost` (not the key `host`)
2. Press `Cmd+C`
3. It should copy normally (not convert to key path)

## Testing Different Indentation Settings

### With 2 spaces (default)
1. Open VS Code settings
2. Set `editor.tabSize` to `2`
3. Set `editor.insertSpaces` to `true`
4. Paste `a.b.c` - should use 2 spaces per level

### With 4 spaces
1. Set `editor.tabSize` to `4`
2. Paste `a.b.c` - should use 4 spaces per level

### With tabs
1. Set `editor.insertSpaces` to `false`
2. Paste `a.b.c` - should use tabs

## Common Test Cases

### Valid Key Paths
- `a` → Single key
- `a.b` → Two levels
- `listing.api.endpoint` → Three levels
- `server-config.port_number` → With hyphens and underscores

### Invalid Key Paths (should fallback to normal paste)
- `a.` → Ends with dot
- `.b` → Starts with dot
- `a..b` → Double dots
- `a b` → Contains spaces
- `a/b` → Contains slashes

## Debugging

If something doesn't work:

### Enable Debug Logging
1. In the Extension Development Host window, open Settings
2. Search for "YAML Key Replace"
3. Set `Log Level` to `debug` or `trace`
4. Or add to your `settings.json`:
   ```json
   {
     "yamlKeyReplace.logLevel": "debug"
   }
   ```

### Check Logs
1. Open the Debug Console in the Extension Development Host window
2. Look for log messages with timestamps and levels:
   - `[HH:MM:SS] [Info]` - General information
   - `[HH:MM:SS] [Debug]` - Detailed debug info
   - `[HH:MM:SS] [Trace]` - Very detailed execution trace
   - `[HH:MM:SS] [Error]` - Errors (shown in red)
3. Try reloading the Extension Development Host window (`Cmd+R` or `Ctrl+R`)

### Log Levels
- `error`: Only critical errors
- `warn`: Warnings and errors
- `info`: General information (default)
- `debug`: Detailed debug info (recommended for troubleshooting)
- `trace`: Very detailed step-by-step execution

## Building for Installation

To package and install the extension:

```bash
# Package the extension
npm run package

# Install in Cursor
cursor --install-extension yaml-key-replace-0.0.1.vsix

# Or install in VS Code
code --install-extension yaml-key-replace-0.0.1.vsix
```

## Next Steps

Once you've verified the extension works:
1. Test with your own YAML files
2. Try different indentation settings
3. Test edge cases (empty files, complex nested structures)
4. Report any issues or suggestions for improvement
