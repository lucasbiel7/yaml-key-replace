/**
 * Utilities for parsing and validating dotted key paths (e.g., "a.b.c")
 */

/**
 * Validates if a string is a valid dotted key path
 * Valid examples: "a", "a.b", "listing.api.endpoint"
 * Invalid: "a.", ".b", "a..b", "", "a b", "a-b-c" (with spaces/special chars)
 */
export function isValidKeyPath(text: string): boolean {
  if (!text || text.trim() !== text) {
    return false;
  }

  // Check for valid pattern: alphanumeric/underscore/hyphen segments separated by dots
  const pattern = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/;
  return pattern.test(text);
}

/**
 * Splits a key path into segments
 * Example: "a.b.c" => ["a", "b", "c"]
 */
export function splitKeyPath(keyPath: string): string[] {
  return keyPath.split('.');
}

/**
 * Joins segments into a key path
 * Example: ["a", "b", "c"] => "a.b.c"
 */
export function joinKeyPath(segments: string[]): string {
  return segments.join('.');
}

/**
 * Normalizes a key path by trimming whitespace
 */
export function normalizeKeyPath(keyPath: string): string {
  return keyPath.trim();
}
