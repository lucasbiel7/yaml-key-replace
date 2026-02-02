/**
 * YAML AST parsing and navigation utilities
 */
import * as vscode from 'vscode';
import { parseDocument, LineCounter, Document, Pair, Scalar, YAMLMap } from 'yaml';

export interface KeyLocation {
  line: number;
  column: number;
  keyNode: Scalar;
}

/**
 * Parse a YAML document with line tracking
 */
export function parseYamlDocument(text: string): { doc: Document; lineCounter: LineCounter } {
  const lineCounter = new LineCounter();
  const doc = parseDocument(text, { lineCounter });
  return { doc, lineCounter };
}

/**
 * Find a key path in the YAML document
 * Returns the location of the key if found, or null if not found
 */
export function findKeyPath(
  doc: Document,
  lineCounter: LineCounter,
  keySegments: string[]
): KeyLocation | null {
  let current: unknown = doc.contents;

  // Navigate through the key segments
  for (let i = 0; i < keySegments.length; i++) {
    const segment = keySegments[i];

    if (!current || !(current instanceof YAMLMap)) {
      return null;
    }

    const pair = current.items.find((item: Pair) => {
      if (item.key instanceof Scalar) {
        return item.key.value === segment;
      }
      return false;
    });

    if (!pair) {
      return null;
    }

    // If this is the last segment, return the key location
    if (i === keySegments.length - 1) {
      const keyNode = pair.key as Scalar;
      if (keyNode.range) {
        const pos = lineCounter.linePos(keyNode.range[0]);
        return {
          line: pos.line - 1, // Convert to 0-based
          column: pos.col - 1, // Convert to 0-based
          keyNode
        };
      }
      return null;
    }

    // Move to the next level
    current = pair.value;
  }

  return null;
}

/**
 * Get the key path at a given position in the document
 * Returns the full dotted path (e.g., "a.b.c") if the position is on a key
 */
export function getKeyPathAtPosition(
  doc: Document,
  lineCounter: LineCounter,
  position: vscode.Position
): string[] | null {
  const offset = lineCounter.lineStarts[position.line] + position.character;
  
  // Find the node at this position
  const path: string[] = [];
  
  function visit(node: unknown, currentPath: string[]): boolean {
    if (node instanceof YAMLMap) {
      for (const item of node.items) {
        if (item instanceof Pair) {
          const keyNode = item.key;
          if (keyNode instanceof Scalar && keyNode.range) {
            const [start, end] = keyNode.range;
            
            // Check if position is within the key range
            if (offset >= start && offset <= end) {
              path.push(...currentPath, String(keyNode.value));
              return true;
            }
            
            // Check the value recursively
            if (item.value) {
              const newPath = [...currentPath, String(keyNode.value)];
              if (visit(item.value, newPath)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }
  
  if (doc.contents) {
    visit(doc.contents, []);
  }
  
  return path.length > 0 ? path : null;
}

/**
 * Check if a position is within a key (not a value)
 */
export function isPositionOnKey(
  doc: Document,
  lineCounter: LineCounter,
  position: vscode.Position
): boolean {
  const offset = lineCounter.lineStarts[position.line] + position.character;
  
  function checkNode(node: unknown): boolean {
    if (node instanceof YAMLMap) {
      for (const item of node.items) {
        if (item instanceof Pair) {
          const keyNode = item.key;
          if (keyNode instanceof Scalar && keyNode.range) {
            const [start, end] = keyNode.range;
            if (offset >= start && offset <= end) {
              return true;
            }
          }
          
          // Check nested values
          if (item.value && checkNode(item.value)) {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  return doc.contents ? checkNode(doc.contents) : false;
}
