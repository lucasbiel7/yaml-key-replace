/**
 * YAML Key Replace - VS Code Extension
 * Main entry point for the extension
 */
import * as vscode from 'vscode';
import { pasteKeyPath } from './commands/pasteKeyPath';
import { copyKeyPath } from './commands/copyKeyPath';
import { logger, initializeLogger } from './logger';

export function activate(context: vscode.ExtensionContext) {
  // Initialize logger first
  initializeLogger(context);
  logger.info('YAML Key Replace extension is activating');

  // Register paste command
  context.subscriptions.push(
    vscode.commands.registerCommand('yamlKeyReplace.pasteKeyPath', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        logger.warn('Paste command called but no active editor');
        return;
      }
      await pasteKeyPath(editor);
    })
  );

  // Register copy command
  context.subscriptions.push(
    vscode.commands.registerCommand('yamlKeyReplace.copyKeyPath', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        logger.warn('Copy command called but no active editor');
        return;
      }
      await copyKeyPath(editor);
    })
  );

  logger.info('YAML Key Replace extension activated successfully');
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
