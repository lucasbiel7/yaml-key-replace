# Release Notes Template

This file serves as a template for creating release notes. The actual release notes are automatically generated from CHANGELOG.md during the release process.

## How to Create a Release

### 1. Update Version

```bash
# For patch release (0.0.1 -> 0.0.2)
npm version patch

# For minor release (0.0.1 -> 0.1.0)
npm version minor

# For major release (0.0.1 -> 1.0.0)
npm version major
```

### 2. Update CHANGELOG.md

Add a new section for the version with changes:

```markdown
## [0.0.2] - 2026-02-03

### Added
- New feature description

### Changed
- Changed behavior description

### Fixed
- Bug fix description

### Deprecated
- Deprecated feature description

### Removed
- Removed feature description

### Security
- Security fix description

---
```

### 3. Commit and Push

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release v0.0.2"
git push origin main
```

### 4. Automatic Process

The GitHub Actions workflows will automatically:
1. Create a git tag (e.g., `v0.0.2`)
2. Build and package the extension
3. Publish to VS Code Marketplace
4. Publish to Open VSX Registry
5. Create a GitHub Release with:
   - Extracted changelog for this version
   - Installation instructions
   - Attached `.vsix` file

## Release Checklist

Before releasing, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Code compiles without errors (`npm run compile`)
- [ ] Linter passes (`npm run lint`)
- [ ] Version number updated in `package.json`
- [ ] CHANGELOG.md updated with all changes
- [ ] Documentation updated (README.md, etc.)
- [ ] Tested in Extension Development Host
- [ ] All features work as expected

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backwards compatible)
- **PATCH** (0.0.1): Bug fixes (backwards compatible)

## Pre-Release Testing

Before releasing to marketplace, test with a pre-release:

```bash
# Push to develop branch
git push origin develop

# Or manually trigger Pre-Release workflow on GitHub
```

This creates a beta release (e.g., `v0.0.1-beta.42`) without publishing to marketplaces.

## Rollback

If you need to rollback a release:

1. **Unpublish from marketplaces** (contact support if needed)
2. **Delete the GitHub release** (or mark as draft)
3. **Delete the tag:**
   ```bash
   git tag -d v0.0.2
   git push origin :refs/tags/v0.0.2
   ```
4. **Revert the version in package.json**
5. **Create a new patch release with fixes**

## Troubleshooting

### Workflow Not Running
- Check if secrets are configured (`VSCE_TOKEN`, `VSX_TOKEN`)
- Verify tag was created correctly
- Check workflow logs in GitHub Actions

### Version Already Published
- Workflows automatically skip if version exists
- Bump version and try again

### Publication Failed
- Check token permissions
- Verify extension name is available
- Review error logs in GitHub Actions

## Resources

- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Open VSX Publishing Guide](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
