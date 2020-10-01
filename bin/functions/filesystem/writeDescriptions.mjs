import { camelize } from '../helpers/camelize.mjs';
import { aliasMapping } from '../process/processTokens.mjs';
import { writeFile } from './writeFile.mjs';
import { errorWriteDescription, errorWriteDescriptionNoSettings } from '../../meta/errors.mjs';
import { processDescriptions } from '../process/processDescriptions.mjs';

/**
 * Write description to file
 *
 * @exports
 * @async
 * @function
 * @param {object} descriptionPages - Array of pages including descriptions
 * @param {object} config - User configuration object
 * @returns {boolean} - Returns true when finished
 * @throws {errorWriteDescription} - Throws error when no description are provided or length is 0
 * @throws {errorWriteDescriptionNoSettings} - Throws error when missing config
 */
export async function writeDescriptions(descriptionPages, config) {
  if (!descriptionPages) throw new Error(errorWriteDescription);
  if (!descriptionPages.length) throw new Error(errorWriteDescription);
  if (!config) throw new Error(errorWriteDescriptionNoSettings);

  return Promise.all(
    descriptionPages.map(async (d) => {
      const translatedName = aliasMapping.find((item) => {
        return item.alias.includes(d.name.toLowerCase());
      }) || { name: d.name };
      translatedName.name = camelize(translatedName.name);

      const PROCESSED_DESCRIPTIONS = processDescriptions(d, translatedName.name, config);
      if (PROCESSED_DESCRIPTIONS.length > 0) {
        const name = translatedName.name;
        const grouped = PROCESSED_DESCRIPTIONS.reduce((res, curr) => {
          if (!res[name]) {
            res[name] = {};
            res[name]['children'] = [];
          }
          if (curr.name === name) {
            res[name] = { ...curr, children: res[name].children };
          } else {
            res[name].children.push(curr);
          }
          return res;
        }, {});

        return await writeFile(
          grouped,
          config.outputFolderDescriptions,
          name,
          'description',
          config.outputDescriptionFormat,
          { dataType: config.outputTokenDataType }
        );
      }
    })
  );
}
