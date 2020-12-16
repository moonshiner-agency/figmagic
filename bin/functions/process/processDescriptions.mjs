import { tokenAliasMapping, componentAliasMapping } from '../../meta/aliasMapping.mjs';
import { errorProcessDescriptions, errorProcessDescriptionsNoConfig } from '../../meta/errors.mjs';
import { camelize } from '../helpers/camelize.mjs';
import marked from 'marked';
import sanitizeHtml from 'sanitize-html';

const mergedAlias = [...tokenAliasMapping, ...componentAliasMapping];

export const getTransformedName = (originalName) => {
  const tN = mergedAlias.find((item) => {
    return item.alias.includes(camelize(originalName).toLowerCase());
  });
  return tN ? tN.name : originalName.replace('group-', '');
};

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
export function processDescriptions(sheet, config) {
  if (!sheet) throw new Error(errorProcessDescriptions);
  if (!config) throw new Error(errorProcessDescriptionsNoConfig);

  const descriptionTags = config.descriptionTags;
  const transformedName = getTransformedName(sheet.name);
  const descriptions = filterDescriptions(sheet.children, transformedName, descriptionTags);
  return descriptions;
}

const filterDescriptions = (sheet, name, descriptionTags, descriptions = []) => {
  if (!sheet || sheet.length === 0) {
    return;
  }

  sheet.forEach((s) => {
    const transformedName = getTransformedName(s.name);
    if (
      descriptionTags.indexOf(transformedName.toLowerCase()) !== -1 ||
      transformedName.indexOf('description-') !== -1
    ) {
      const text =
        (s.children && s.children.find((c) => c.name === 'text' || c.name === 'content')) || s;

      if (!text || !text.characters) {
        return;
      }

      const markdownText = marked(text.characters).replace(/\n/g, '');
      descriptions.push({
        text: sanitizeHtml(markdownText, {
          disallowedTagsMode: 'escape'
        }),
        parentName: name.replace('group-', ''),
        name: camelize(transformedName)
      });
    }
    if (s.name.indexOf('ignore') === -1) {
      filterDescriptions(s.children, transformedName, descriptionTags, descriptions);
    }
  });
  return descriptions;
};
