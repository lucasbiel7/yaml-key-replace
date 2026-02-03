# Changelog

All notable changes to the YAML Key Replace extension will be documented in this file.

## [Unreleased]

---

## [0.0.8] - 2026-02-03

### Added
- **Cursor Navigation**: Added automatic viewport centering when pasting YAML keys. The screen now scrolls to show the inserted text, making it easier to verify that paste operations worked correctly.

### Technical
- **Code Refactoring**: Extracted cursor navigation logic into a reusable `moveCursorAndReveal()` helper function
- **Maintainability**: Reduced code duplication by centralizing cursor positioning and viewport reveal logic
- **Consistency**: Ensured all paste operations use the same cursor navigation behavior

---

## [0.0.6] - 2026-02-03

### Fixed
- **Partial Path Insertion Level**: Fixed bug where pasting a key path with existing parent levels would insert at the wrong nesting level. For example, when `test.endpoint.get` exists and you paste `test.endpoint.put`, it now correctly inserts `put:` at the same level as `get`, not inside `get`.
- **Indentation Calculation**: Fixed incorrect indentation when inserting partial paths. The extension now uses the same indentation level as sibling keys instead of adding an extra level.

### Technical
- Improved `findPartialKeyPath()` to correctly identify the target map level for insertion
- Fixed indentation logic in `pasteKeyPath` to use sibling key indentation instead of adding extra levels

---

## [0.0.5] - 2026-02-03

### Added
- **Smart Paste with Partial Path Detection**: When pasting a key path where some parent levels already exist (e.g., pasting `test.endpoint.put` when `test.endpoint.get` exists), the extension now intelligently inserts only the missing segments (`put:`) at the correct indentation level, instead of recreating the entire structure. This keeps your YAML files clean and avoids unnecessary duplication.

### Changed
- **Copy Keybinding**: Changed from `Ctrl+C` / `Cmd+C` to `Ctrl+Shift+C` / `Cmd+Shift+C` to avoid overriding the default copy behavior. This allows normal text copying to work as expected while still providing the smart YAML key path copy feature when needed.

### Technical
- Added `findPartialKeyPath()` function to detect existing path segments in YAML structure
- Enhanced paste logic to calculate correct indentation for partial path insertions
- Improved type safety with null checks for YAML node ranges

---

## [0.0.4] - 2026-02-02

### Fixed
- Fix packaged extension missing production dependency (`yaml`), which prevented activation and caused contributed commands to be "not found".

---

## [0.0.3] - 2026-02-02

### Fixed
- Fix "command not found" when triggering copy/paste via keybindings by activating the extension on command execution.

---

## [0.0.1] - 2026-02-02

### 🎉 Initial Release

#### Core Features
- **Smart Paste**: Paste dotted key paths (e.g., `listing.api.endpoint`) and automatically expand to YAML structure
- **Smart Copy**: Copy YAML properties as flattened key paths (e.g., `database.credentials.username`)
- **Navigation**: If property already exists, navigates to it instead of duplicating
- **Indentation**: Respects editor's configured indentation (spaces or tabs)
- **Conditional Keybindings**: Only overrides Cmd+V/Ctrl+V in YAML files

#### Technical Implementation
- **Centralized Logging**: Professional logging system with configurable levels (error, warn, info, debug, trace)
- **YAML Parsing**: Uses `yaml` library for robust parsing with line tracking
- **Key Path Validation**: Validates dotted key paths before expansion
- **Fallback Behavior**: Non-key text pastes/copies normally

#### Documentation
- Comprehensive README with usage examples
- Quick start guide for testing
- Implementation details document
- Example YAML file for testing

---

[Unreleased]: https://github.com/lucasbiel7/yaml-key-replace/compare/v0.0.6...HEAD
[0.0.6]: https://github.com/lucasbiel7/yaml-key-replace/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/lucasbiel7/yaml-key-replace/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/lucasbiel7/yaml-key-replace/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/lucasbiel7/yaml-key-replace/compare/v0.0.2...v0.0.3
[0.0.1]: https://github.com/lucasbiel7/yaml-key-replace/releases/tag/v0.0.1
