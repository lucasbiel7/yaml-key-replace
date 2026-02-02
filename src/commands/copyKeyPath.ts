/**
 * Copy command - converts YAML property to dotted key path
 */
import * as vscode from 'vscode';
import { parseYamlDocument, getKeyPathAtPosition, isPositionOnKey } from '../yaml/yamlAst';
import { joinKeyPath } from '../yaml/keyPath';
import { logger } from '../logger';

/**
 * Main copy command handler
 */
export async function copyKeyPath(editor: vscode.TextEditor): Promise<void> {
  try {
    const selection = editor.selection;
    const documentText = editor.document.getText();
    logger.debug('Copy command invoked', { isEmpty: selection.isEmpty, isSingleLine: selection.isSingleLine });

    // If selection is empty or very small, check if cursor is on a key
    if (selection.isEmpty || selection.isSingleLine) {
      const position = selection.active;
      logger.trace('Checking if cursor is on a key', { line: position.line, column: position.character });

      // Parse YAML document
      const { doc, lineCounter } = parseYamlDocument(documentText);

      // Check if position is on a key
      if (!isPositionOnKey(doc, lineCounter, position)) {
        logger.debug('Cursor is not on a key, using default copy');
        // Not on a key, use default copy
        await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        return;
      }

      // Get the key path at this position
      const keyPath = getKeyPathAtPosition(doc, lineCounter, position);

      if (keyPath && keyPath.length > 0) {
        // Copy the flattened key path to clipboard
        const flattenedPath = joinKeyPath(keyPath);
        logger.info('Copied flattened key path', { keyPath: flattenedPath });
        await vscode.env.clipboard.writeText(flattenedPath);
        
        // Show message to user
        vscode.window.showInformationMessage(`Copied: ${flattenedPath}`);
        return;
      }
    } else {
      // There's a selection - check if it includes a key
      const startPosition = selection.start;
      logger.trace('Selection detected, checking if it includes a key', { start: { line: startPosition.line, column: startPosition.character } });
      
      // Parse YAML document
      const { doc, lineCounter } = parseYamlDocument(documentText);

      // Check if the selection start is on a key
      if (isPositionOnKey(doc, lineCounter, startPosition)) {
        // Get the key path at the start of selection
        const keyPath = getKeyPathAtPosition(doc, lineCounter, startPosition);

        if (keyPath && keyPath.length > 0) {
          // Copy the flattened key path to clipboard
          const flattenedPath = joinKeyPath(keyPath);
          logger.info('Copied flattened key path from selection', { keyPath: flattenedPath });
          await vscode.env.clipboard.writeText(flattenedPath);
          
          // Show message to user
          vscode.window.showInformationMessage(`Copied: ${flattenedPath}`);
          return;
        }
      }
    }

    // Default behavior - just copy the selection
    logger.debug('Using default copy behavior');
    await vscode.commands.executeCommand('editor.action.clipboardCopyAction');

  } catch (error) {
    logger.error('Error in copyKeyPath:', error);
    // Fallback to default copy on error
    await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
  }
}
