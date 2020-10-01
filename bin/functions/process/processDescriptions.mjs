import { errorProcessDescriptions, errorProcessDescriptionsNoConfig } from '../../meta/errors.mjs';

/**
 * Process descriptions
 *
 * @exports
 * @function
 * @param {object} sheet - Sheet object from Figma
 * @param {string} name - Sheet name
 * @param {object} [config] - User configuration object
 * @returns {object} - returns object with design tokens
 * @throws {errorProcessDescriptions} - When missing sheet or name
 * @throws {errorProcessDescriptionsNoConfig} - When missing config, required for certain processing
 */
export function processDescriptions(sheet, name, config) {
  if (!sheet) throw new Error(errorProcessDescriptions);
  if (!config) throw new Error(errorProcessDescriptionsNoConfig);
  const descriptions = filterDescriptions(sheet.children, name);
  return descriptions;
}

const filterDescriptions = (sheet, name, descriptions = []) => {
  if (!sheet || sheet.length === 0) {
    return;
  }
  sheet.forEach((s) => {
    if (s.name.toLowerCase() === 'description') {
      descriptions.push({ text: s.characters, name: name.replace('group-', '') });
    }
    filterDescriptions(s.children, s.name, descriptions);
  });
  return descriptions;
};
