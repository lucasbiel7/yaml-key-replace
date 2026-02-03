/**
 * Paste command - expands dotted key paths to YAML structure
 */
import * as vscode from 'vscode';
import { isValidKeyPath, splitKeyPath, normalizeKeyPath } from '../yaml/keyPath';
import { parseYamlDocument, findKeyPath, findPartialKeyPath } from '../yaml/yamlAst';
import { logger } from '../logger';

/**
 * Get the indentation unit from the editor configuration
 */
function getIndentUnit(editor: vscode.TextEditor): string {
  const options = editor.options;
  const insertSpaces = options.insertSpaces as boolean;
  const tabSize = options.tabSize as number;

  if (insertSpaces) {
    return ' '.repeat(tabSize);
  } else {
    return '\t';
  }
}

/**
 * Get the base indentation from the current line
 */
function getBaseIndent(editor: vscode.TextEditor): string {
  const position = editor.selection.active;
  const line = editor.document.lineAt(position.line);
  const lineText = line.text;

  // Extract leading whitespace
  const match = lineText.match(/^(\s*)/);
  return match ? match[1] : '';
}

/**
 * Generate YAML structure from key segments
 */
function generateYamlStructure(
  keySegments: string[],
  baseIndent: string,
  indentUnit: string
): string {
  const lines: string[] = [];

  for (let i = 0; i < keySegments.length; i++) {
    const segment = keySegments[i];
    const currentIndent = baseIndent + indentUnit.repeat(i);

    if (i === keySegments.length - 1) {
      // Last segment - just the key with colon (no value)
      lines.push(`${currentIndent}${segment}:`);
    } else {
      // Intermediate segments
      lines.push(`${currentIndent}${segment}:`);
    }
  }

  return lines.join('\n');
}

/**
 * Main paste command handler
 */
export async function pasteKeyPath(editor: vscode.TextEditor): Promise<void> {
  try {
    // Read clipboard
    const clipboardText = await vscode.env.clipboard.readText();
    const normalizedText = normalizeKeyPath(clipboardText);
    logger.debug('Paste command invoked', { clipboardText: normalizedText });

    // Check if it's a valid key path
    if (!isValidKeyPath(normalizedText)) {
      logger.debug('Clipboard text is not a valid key path, using default paste');
      // Not a valid key path, use default paste
      await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
      return;
    }

    const keySegments = splitKeyPath(normalizedText);
    logger.trace('Key segments:', keySegments);
    const documentText = editor.document.getText();

    // Parse YAML document
    const { doc, lineCounter } = parseYamlDocument(documentText);
    logger.trace('YAML document parsed successfully');

    // Check if the key path already exists
    const existingLocation = findKeyPath(doc, lineCounter, keySegments);

    if (existingLocation) {
      // Key exists - navigate to it
      logger.info('Key path already exists, navigating to it', { keyPath: normalizedText, line: existingLocation.line });
      const position = new vscode.Position(existingLocation.line, existingLocation.column);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
      );

      // Show message to user
      vscode.window.showInformationMessage(
        `Property "${normalizedText}" already exists. Navigated to it.`
      );
      return;
    }

    // Check if there's a partial path that exists
    const partialResult = findPartialKeyPath(doc, lineCounter, keySegments);

    if (partialResult.existingDepth > 0 && partialResult.insertLocation && partialResult.remainingSegments.length > 0) {
      // Partial path exists - insert only the remaining segments
      logger.info('Partial key path exists, inserting remaining segments', {
        existingDepth: partialResult.existingDepth,
        remainingSegments: partialResult.remainingSegments
      });

      const indentUnit = getIndentUnit(editor);
      const insertLine = partialResult.insertLocation.line;

      // Validate that insertLine is within document bounds
      const lastLineNumber = editor.document.lineCount - 1;
      const safeInsertLine = Math.min(insertLine, lastLineNumber);

      // Get the indentation from the sibling key location (not the last line of subtree)
      let baseIndent = '';
      if (partialResult.siblingKeyLocation) {
        const siblingLine = Math.min(partialResult.siblingKeyLocation.line, lastLineNumber);
        const siblingKeyLine = editor.document.lineAt(siblingLine);
        baseIndent = siblingKeyLine.text.match(/^(\s*)/)?.[1] || '';
      } else {
        // Fallback: use the indentation from the insert line
        const lastKeyLine = editor.document.lineAt(safeInsertLine);
        baseIndent = lastKeyLine.text.match(/^(\s*)/)?.[1] || '';
      }

      // Generate YAML structure for remaining segments
      const yamlStructure = generateYamlStructure(
        partialResult.remainingSegments,
        baseIndent,
        indentUnit
      );

      // Insert after the last key in the existing structure
      // If insertLine is the last line of the document, we need to add a newline before
      const insertPosition = new vscode.Position(safeInsertLine + 1, 0);
      const isLastLine = safeInsertLine === lastLineNumber;
      const textToInsert = isLastLine ? '\n' + yamlStructure : yamlStructure + '\n';

      await editor.edit((editBuilder) => {
        editBuilder.insert(insertPosition, textToInsert);
      });

      logger.info('Remaining segments inserted successfully', {
        keyPath: normalizedText,
        insertedAt: { line: insertPosition.line, column: insertPosition.character }
      });

      // Move cursor to the end of the inserted text
      const lines = yamlStructure.split('\n');
      const newLine = insertPosition.line + lines.length - 1;
      const lastLine = lines[lines.length - 1];
      const newColumn = lastLine.length;
      const newPosition = new vscode.Position(newLine, newColumn);
      editor.selection = new vscode.Selection(newPosition, newPosition);

      return;
    }

    // Key doesn't exist at all - insert full structure
    logger.debug('Key path does not exist, expanding to YAML structure');
    const baseIndent = getBaseIndent(editor);
    const indentUnit = getIndentUnit(editor);
    logger.trace('Indentation settings', { baseIndent: baseIndent.length, indentUnit: indentUnit.length });
    const yamlStructure = generateYamlStructure(keySegments, baseIndent, indentUnit);

    // Insert at cursor position
    const position = editor.selection.active;
    await editor.edit((editBuilder) => {
      editBuilder.insert(position, yamlStructure);
    });
    logger.info('Key path expanded successfully', { keyPath: normalizedText, insertedAt: { line: position.line, column: position.character } });

    // Move cursor to the end of the inserted text (after the last colon)
    const lines = yamlStructure.split('\n');
    const newLine = position.line + lines.length - 1;
    const lastLine = lines[lines.length - 1];
    const newColumn = lastLine.length;
    const newPosition = new vscode.Position(newLine, newColumn);
    editor.selection = new vscode.Selection(newPosition, newPosition);

  } catch (error) {
    logger.error('Error in pasteKeyPath:', error);
    // Fallback to default paste on error
    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
  }
}
