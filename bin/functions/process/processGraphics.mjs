import { camelize } from '../helpers/camelize.mjs';
import { getFromApi } from '../filesystem/getFromApi.mjs';

import {
  errorProcessGraphics,
  errorProcessGraphicsImageError,
  errorProcessGraphicsNoImages,
  errorGetIds,
  errorGetFileList,
  errorGetIdString
} from '../../meta/errors.mjs';

/**
 * Download all image assets from Figma page
 *
 * @exports
 * @async
 * @function
 * @param {object} graphicsPage - Children of the Figma 'Graphics' page
 * @param {object} config - Configuration object
 * @returns {array} - Returns file list
 * @throws {errorProcessGraphics} - Throws error if missing missingPage
 */
export async function processGraphics(graphicsPage, config) {
  if (!graphicsPage) throw new Error(errorProcessGraphics);

  const { token, url, outputFormatGraphics, outputScaleGraphics } = config;
  const IDS = getIds(graphicsPage);
  const ID_STRING = getIdString(IDS);
  const SETTINGS = `&scale=${outputScaleGraphics}&format=${outputFormatGraphics}`;
  const URL = `${url}?ids=${ID_STRING}${SETTINGS}`;

  const IMAGE_RESPONSE = await getFromApi(token, URL, 'images');
  if (IMAGE_RESPONSE.err) throw new Error(errorProcessGraphicsImageError);
  if (!IMAGE_RESPONSE.images) throw new Error(errorProcessGraphicsNoImages);

  return getFileList(IMAGE_RESPONSE, IDS, outputFormatGraphics);
}

/**
 * Get cleaned list of files
 *
 * @export
 * @function
 * @param {object} imageResponse - Figma API response
 * @param {array} ids - Array of asset IDs
 * @param {string} outputFormatGraphics - String representing expected output format
 * @returns {array} - Array of files with properties
 * @throws {errorGetFileList} - Throws error if missing required arguments
 */
export const getFileList = (imageResponse, ids, outputFormatGraphics) => {
  if (!imageResponse || !ids || !outputFormatGraphics) throw new Error(errorGetFileList);

  const fileList = [];
  Object.entries(imageResponse.images).forEach(async ([figmaId, url]) => {
    const entity = ids.find(({ id }) => id === figmaId);
    const name = camelize(entity.name);
    const FILE = `${name}.${outputFormatGraphics}`;

    fileList.push({ url, file: FILE, group: entity.group });
  });
  return fileList;
};

const getComponentChildren = (frame, componentChildren = []) => {
  frame.children.forEach((f) => {
    if (f.type === 'COMPONENT') {
      componentChildren.push(f);
    } else if (f.type === 'GROUP') {
      getComponentChildren(f, componentChildren);
    }
  });
  return componentChildren;
};

const getFrameIds = (frame) => {
  const componentChildren = getComponentChildren(frame);
  return componentChildren
    .filter((item) => item.type === 'COMPONENT')
    .map((item) => ({ id: item.id, name: item.name, group: frame.name }));
};

/**
 * Get IDs from graphics page
 *
 * @export
 * @function
 * @param {object} graphicsPage - Figma 'Graphics' page
 * @returns {array} - Array of graphics items
 * @throws {errorGetIds} - Throws error if no graphics page is provided
 * @throws {errorGetIds} - Throws error if no graphics page is zero-length
 */
export const getIds = (graphicsPage) => {
  if (!graphicsPage) throw new Error(errorGetIds);
  if (!(graphicsPage.length > 0)) throw new Error(errorGetIds);

  let items = [];

  graphicsPage
    .filter((item) => item.type === 'FRAME')
    .forEach((frame) => {
      items = [...items, ...getFrameIds(frame)];
    });
  // Filter out anything that is not a component
  return items;
};

/**
 * Collate valid string of IDs
 *
 * @export
 * @function
 * @param {array} ids - Figma 'Graphics' page
 * @returns {string} - Return ID string
 * @throws {errorGetIdString} - Throws error when no required arguments are provided
 */
export const getIdString = (ids) => {
  if (!ids) throw new Error(errorGetIdString);

  return ids.map(({ id }) => id).join();
};
