/**
 * Auto-generate TypeScript constants and types from i18n messages.json
 *
 * This script reads packages/i18n/locales/en/messages.json and generates:
 * - Type-safe key constants with JSDoc comments showing the message content
 * - TypeScript type for all valid i18n keys
 *
 * Usage:
 *   pnpm generate:i18n-keys
 *
 * Output:
 *   packages/shared/lib/i18n/keys.ts
 **/

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MESSAGES_PATH = resolve(import.meta.dirname, '../packages/i18n/locales/ja/messages.json');
const OUTPUT_PATH = resolve(import.meta.dirname, '../packages/shared/lib/i18n/keys.ts');

interface MessageEntry {
  message: string;
  description?: string;
  placeholders?: Record<string, { content: string; example?: string }>;
}

type Messages = Record<string, MessageEntry>;

/**
 * Convert i18n key to TypeScript constant name
 * Following Chrome Extension naming convention: descriptive, lowercase with underscores
 *
 * Examples:
 *   'extensionName' -> 'EXTENSION_NAME'
 *   'make_note_button_msg' -> 'MAKE_NOTE_BUTTON'
 *   'usage02' -> 'USAGE_02'
 */
const keyToConstantName = (key: string): string => {
  // Remove common suffixes
  let name = key.replace(/_msg$/i, '').replace(/_button_msg$/i, '_button');

  // Convert camelCase to SCREAMING_SNAKE_CASE
  name = name.replace(/([a-z])([A-Z])/g, '$1_$2');

  // Convert to uppercase
  name = name.toUpperCase();

  return name;
};

/**
 * Escape special characters in message for JSDoc comment
 */
const escapeMessage = (message: string): string => message.replace(/\*\//g, '*\\/').replace(/\n/g, ' ');

/**
 * Generate JSDoc comment for i18n key
 */
const generateJSDoc = (entry: MessageEntry, indent: string = '  '): string => {
  const lines: string[] = [];

  // Message content
  const escapedMessage = escapeMessage(entry.message);
  lines.push(`${indent}/**`);
  lines.push(`${indent} * "${escapedMessage}"`);

  // Description (if exists)
  if (entry.description) {
    lines.push(`${indent} *`);
    lines.push(`${indent} * ${entry.description}`);
  }

  // Placeholders (if exists)
  if (entry.placeholders) {
    lines.push(`${indent} *`);
    lines.push(`${indent} * Placeholders:`);
    Object.entries(entry.placeholders).forEach(([name, placeholder]) => {
      const example = placeholder.example ? ` (e.g., "${placeholder.example}")` : '';
      lines.push(`${indent} * - $${name.toUpperCase()}$${example}`);
    });
  }

  lines.push(`${indent} */`);
  return lines.join('\n');
};

/**
 * Group keys by category based on prefix
 */
const categorizeKeys = (messages: Messages): Map<string, [string, MessageEntry][]> => {
  const categories = new Map<string, [string, MessageEntry][]>();

  const categoryPatterns: [string, RegExp][] = [
    ['Extension Metadata', /^(extension|app)(Name|Description|ShortName|Title)/i],
    ['Usage Instructions', /^usage/i],
    ['Buttons', /^(make|setting|menu|cancel|save|close|delete|copy|export).*button/i],
    ['Messages', /^(welcome|no_note|add_note|confirm|cannot|note_unavailable).*msg/i],
    ['Headers', /^(note|settings|how_to_use).*header/i],
    ['Labels', /^(pin|color|open|position|size|detail|edit|delete)_msg$/i],
    ['Explanations', /explain_msg$/i],
    ['Sort Options', /sort_option$/i],
    ['Error Display', /^display(Error|Display)/i],
    ['Misc', /.*/],
  ];

  Object.entries(messages).forEach(([key, entry]) => {
    const category = categoryPatterns.find(([, pattern]) => pattern.test(key))?.[0] || 'Misc';

    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push([key, entry]);
  });

  return categories;
};

/**
 * Detect and resolve duplicate constant names
 */
const detectDuplicates = (messages: Messages): Map<string, string[]> => {
  const constantToKeys = new Map<string, string[]>();

  Object.keys(messages).forEach(key => {
    const constantName = keyToConstantName(key);
    if (!constantToKeys.has(constantName)) {
      constantToKeys.set(constantName, []);
    }
    constantToKeys.get(constantName)!.push(key);
  });

  // Find duplicates
  const duplicates = new Map<string, string[]>();
  constantToKeys.forEach((keys, constantName) => {
    if (keys.length > 1) {
      duplicates.set(constantName, keys);
    }
  });

  return duplicates;
};

/**
 * Resolve duplicate constant names by using the original key name
 */
const resolveConstantName = (key: string, duplicateMap: Map<string, string[]>): string => {
  const baseConstantName = keyToConstantName(key);
  const duplicateKeys = duplicateMap.get(baseConstantName);

  if (!duplicateKeys || duplicateKeys.length === 1) {
    return baseConstantName;
  }

  // For duplicates, use a safer naming strategy:
  // - Prioritize the key that matches the constant name pattern
  // - For others, use the original key in SCREAMING_SNAKE_CASE

  // Convert original key to constant format
  const uniqueName = key.toUpperCase().replace(/([a-z])([A-Z])/g, '$1_$2');

  return uniqueName;
};

/**
 * Main function
 */
const generateI18nKeys = (): void => {
  console.log('📖 Reading messages.json...');
  const messages: Messages = JSON.parse(readFileSync(MESSAGES_PATH, 'utf-8'));

  console.log(`✅ Found ${Object.keys(messages).length} i18n keys`);

  // Detect duplicates
  const duplicates = detectDuplicates(messages);
  if (duplicates.size > 0) {
    console.log('⚠️  Warning: Duplicate constant names detected:');
    duplicates.forEach((keys, constantName) => {
      console.log(`   ${constantName}: ${keys.join(', ')}`);
    });
    console.log('   Using original key names to avoid conflicts.');
  }

  const categories = categorizeKeys(messages);

  console.log('🔧 Generating TypeScript code...');

  const lines: string[] = [];

  // Header
  lines.push('/**');
  lines.push(' * Auto-generated i18n key constants');
  lines.push(' * Generated from: packages/i18n/locales/en/messages.json');
  lines.push(' *');
  lines.push(' * DO NOT EDIT THIS FILE MANUALLY!');
  lines.push(' * Run `pnpm generate:i18n-keys` to regenerate.');
  lines.push(' *');
  lines.push(' * Usage:');
  lines.push(' * ```typescript');
  lines.push(' * import { t } from "@extension/i18n";');
  lines.push(' * import { I18N } from "@extension/shared/lib/i18n/keys";');
  lines.push(' *');
  lines.push(' * // Use with autocomplete and type safety');
  lines.push(' * const message = t(I18N.WELCOME);');
  lines.push(' * ```');
  lines.push(' */');
  lines.push('');

  // Track used constant names to ensure uniqueness
  const usedConstantNames = new Set<string>();

  // Constants object
  lines.push('export const I18N = {');

  categories.forEach((entries, categoryName) => {
    if (entries.length === 0) return;

    lines.push(`  // ${categoryName}`);

    entries.forEach(([key, entry]) => {
      const jsDoc = generateJSDoc(entry);
      lines.push(jsDoc);

      let constantName = resolveConstantName(key, duplicates);

      // Ensure uniqueness (should not happen, but just in case)
      let counter = 1;
      const originalName = constantName;
      while (usedConstantNames.has(constantName)) {
        constantName = `${originalName}_${counter}`;
        counter++;
      }
      usedConstantNames.add(constantName);

      lines.push(`  ${constantName}: '${key}' as const,`);
    });
  });

  lines.push('} as const;');
  lines.push('');

  // Type definition
  lines.push('/**');
  lines.push(' * Union type of all valid i18n keys');
  lines.push(' */');
  lines.push('export type I18nKey = (typeof I18N)[keyof typeof I18N];');
  lines.push('');

  // Helper function for keys with placeholders
  const keysWithPlaceholders = Object.entries(messages)
    .filter(([, entry]) => entry.placeholders)
    .map(([key]) => resolveConstantName(key, duplicates));

  if (keysWithPlaceholders.length > 0) {
    lines.push('/**');
    lines.push(' * Get list of keys that use placeholders');
    lines.push(' */');
    lines.push('export const I18N_WITH_PLACEHOLDERS = [');
    keysWithPlaceholders.forEach(constantName => {
      lines.push(`  I18N.${constantName},`);
    });
    lines.push('] as const;');
    lines.push('');
  }

  const output = lines.join('\n');

  console.log('💾 Writing to packages/shared/lib/i18n/keys.ts...');
  writeFileSync(OUTPUT_PATH, output, 'utf-8');

  console.log('✨ Successfully generated i18n keys!');
  console.log(`   Total keys: ${Object.keys(messages).length}`);
  console.log(`   Categories: ${categories.size}`);
  if (duplicates.size > 0) {
    console.log(`   Duplicates resolved: ${duplicates.size}`);
  }
};

// Run
try {
  generateI18nKeys();
} catch (error) {
  console.error('❌ Failed to generate i18n keys:', error);
  process.exit(1);
}
