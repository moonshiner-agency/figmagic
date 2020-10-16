import { camelize } from '../helpers/camelize.mjs';
import { getFromApi } from '../filesystem/getFromApi.mjs';

import {
  errorProcessGraphics,
  errorProcessGraphicsImageError,
  errorProcessGraphicsNoImages,
  errorGetIds,
  errorGetFileList
} from '../../meta/errors.mjs';

/**
 * Download all image assets from Figma page
 *
 * @exports
 * @async
 * @function
 * @param {object} graphicsPage - Children of the Figma 'Graphics' page
 * @param {object} graphicConfig
 * @param {object} config - Configuration object
 * @returns {array} - Returns file list
 * @throws {errorProcessGraphics} - Throws error if missing missingPage
 */
export async function processGraphics(graphicsPage, parentName, config) {
  if (!graphicsPage) throw new Error(errorProcessGraphics);

  const { token, url, outputFormatGraphics, outputScaleGraphics, graphicConfig } = config;
  const IDS = getIds(graphicsPage, parentName, graphicConfig);
  const ID_STRING = IDS.map((i) => i.id).join();
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

    fileList.push({ url, file: FILE, group: entity.group, parentName: entity.parentName });
  });
  return fileList;
};

const getGraphicNodes = (frame, graphicConfig, graphicNodes = []) => {
  if (
    graphicConfig.frameNames.length !== 0 &&
    graphicConfig.frameNames.indexOf(frame.name) === -1
  ) {
    return [];
  }

  frame.children.forEach((f) => {
    if (graphicConfig.types.indexOf(f.type) !== -1) {
      graphicNodes.push(f);
    } else if (f.type === 'GROUP') {
      getGraphicNodes(f, graphicConfig, graphicNodes);
    }
  });
  return graphicNodes;
};

const getFrameIds = (frame, parentName, graphicConfig) => {
  const graphicNodes = getGraphicNodes(frame, graphicConfig);
  return graphicNodes.map((item) => ({
    id: item.id,
    name: item.name,
    group: frame.name,
    parentName
  }));
};

/**
 * Get IDs from graphics page
 *
 * @export
 * @function
 * @param {object} graphicsPage - Figma 'Graphics' page
 * @param {object} graphicConfig
 * @returns {array} - Array of graphics items
 * @throws {errorGetIds} - Throws error if no graphics page is provided
 * @throws {errorGetIds} - Throws error if graphics page is zero-length
 */
export const getIds = (graphicsPage, parentName, graphicConfig) => {
  if (!graphicsPage) throw new Error(errorGetIds);
  if (graphicsPage.length === 0) throw new Error(errorGetIds);

  let items = [];

  graphicsPage
    .filter((item) => item.type === 'FRAME')
    .forEach((frame) => {
      items = [...items, ...getFrameIds(frame, parentName, graphicConfig)];
    });
  return items;
};
