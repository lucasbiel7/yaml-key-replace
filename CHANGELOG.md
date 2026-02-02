# Changelog

All notable changes to the YAML Key Replace extension will be documented in this file.

## [Unreleased]

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

[Unreleased]: https://github.com/lucasbiel7/yaml-key-replace/compare/v0.0.3...HEAD
[0.0.3]: https://github.com/lucasbiel7/yaml-key-replace/compare/v0.0.2...v0.0.3
[0.0.1]: https://github.com/lucasbiel7/yaml-key-replace/releases/tag/v0.0.1
