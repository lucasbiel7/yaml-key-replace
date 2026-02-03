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

export interface PartialKeyPathResult {
  existingDepth: number; // How many segments already exist
  insertLocation: KeyLocation | null; // Where to insert the remaining segments (last line of subtree)
  siblingKeyLocation: KeyLocation | null; // Location of the sibling key (for indentation reference)
  remainingSegments: string[]; // Segments that need to be inserted
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

/**
 * Find the last line of a node and all its descendants
 * This is needed to insert after all children of a node, not just after the node's key
 */
function findLastLineOfNode(node: unknown, lineCounter: LineCounter): number | null {
    if (!node) {
        return null;
    }

    let lastLine: number | null = null;

    // Helper to update lastLine if we find a later position
    const updateLastLine = (range: [number, number, number] | null | undefined) => {
        if (range) {
            const pos = lineCounter.linePos(range[1]); // Use end position
            const line = pos.line - 1; // Convert to 0-based
            if (lastLine === null || line > lastLine) {
                lastLine = line;
            }
        }
    };

    // Recursively find the last line in the tree
    const traverse = (n: unknown) => {
        if (n instanceof Scalar && n.range) {
            updateLastLine(n.range);
        } else if (n instanceof Pair) {
            if (n.key instanceof Scalar && n.key.range) {
                updateLastLine(n.key.range);
            }
            if (n.value) {
                traverse(n.value);
            }
        } else if (n instanceof YAMLMap) {
            for (const item of n.items) {
                traverse(item);
            }
        }
    };

    traverse(node);
    return lastLine;
}

/**
 * Find the deepest existing partial path for a key path
 * Returns information about which segments exist and where to insert the rest
 *
 * Example: If YAML has "test.endpoint.get" and we want to paste "test.endpoint.put"
 * This will return that "test.endpoint" exists (depth 2) and where to insert "put"
 */
export function findPartialKeyPath(
    doc: Document,
    lineCounter: LineCounter,
    keySegments: string[]
): PartialKeyPathResult {
    let current: unknown = doc.contents;
    let lastValidPair: Pair | null = null;
    let lastValidMap: YAMLMap | null = null;
    let existingDepth = 0;

    // Navigate through the key segments to find how deep we can go
    for (let i = 0; i < keySegments.length; i++) {
        const segment = keySegments[i];

        if (!current || !(current instanceof YAMLMap)) {
            break;
        }

        const pair = current.items.find((item: Pair) => {
            if (item.key instanceof Scalar) {
                return item.key.value === segment;
            }
            return false;
        });

        if (!pair) {
            // This segment doesn't exist, stop here
            // But we found a valid map where we can insert
            if (current instanceof YAMLMap) {
                lastValidMap = current;
            }
            break;
        }

        // This segment exists
        existingDepth = i + 1;
        lastValidPair = pair;

        // Store the current map before moving to the next level
        if (current instanceof YAMLMap) {
            lastValidMap = current;
        }

        current = pair.value;
    }

    // Calculate remaining segments
    const remainingSegments = keySegments.slice(existingDepth);

  // If we found at least one existing segment, find where to insert
  let insertLocation: KeyLocation | null = null;
  let siblingKeyLocation: KeyLocation | null = null;

  // We want to insert at the level of lastValidMap (where the missing segment should go)
  if (lastValidMap && remainingSegments.length > 0) {
    // Find the last item in the map where we want to insert
    const items = lastValidMap.items;
    if (items.length > 0) {
      const lastItem = items[items.length - 1];

      if (lastItem instanceof Pair && lastItem.key instanceof Scalar) {
        const keyNode = lastItem.key as Scalar;
        if (keyNode.range) {
          // Store the sibling key location (for indentation reference)
          const keyPos = lineCounter.linePos(keyNode.range[0]);
          siblingKeyLocation = {
            line: keyPos.line - 1,
            column: keyPos.col - 1,
            keyNode
          };

          // Find the last line of the entire subtree of lastItem (including all its children)
          const lastLineOfSubtree = findLastLineOfNode(lastItem, lineCounter);

          if (lastLineOfSubtree !== null) {
            insertLocation = {
              line: lastLineOfSubtree,
              column: 0,
              keyNode
            };
          }
        }
      }
    }
  } else if (lastValidPair && lastValidPair.value instanceof YAMLMap && remainingSegments.length > 0) {
    // Empty map case - insert after the parent key
    if (lastValidPair.key instanceof Scalar) {
      const keyNode = lastValidPair.key as Scalar;
      if (keyNode.range) {
        const pos = lineCounter.linePos(keyNode.range[0]);
        insertLocation = {
          line: pos.line - 1,
          column: pos.col - 1,
          keyNode
        };
        siblingKeyLocation = insertLocation;
      }
    }
  }

  return {
    existingDepth,
    insertLocation,
    siblingKeyLocation,
    remainingSegments
  };
}
