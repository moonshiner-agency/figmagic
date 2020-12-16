import { camelize } from '../helpers/camelize.mjs';
import { removeNonIntegerValues } from '../helpers/removeNonInteger.mjs';

import {
  errorSetupMediaQueryTokensNoFrame,
  errorSetupMediaQueryTokensNoChildren,
  errorSetupMediaQueryTokensMissingProps
} from '../../meta/errors.mjs';

/**
 * Places all Figma media queries into a clean object
 *
 * @exports
 * @function
 * @param {object} mediaQueryFrame - The media queries frame from Figma
 * @returns {object} - Returns an object with all the media queries
 * @throws {errorSetupMediaQueryTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupMediaQueryTokensNoChildren} - When no children in Figma frame
 * @throws {errorSetupMediaQueryTokensMissingProps} - When missing required props in frame children
 */
export function setupMediaQueryTokens(mediaQueryFrame) {
  if (!mediaQueryFrame) throw new Error(errorSetupMediaQueryTokensNoFrame);
  if (!mediaQueryFrame.children) throw new Error(errorSetupMediaQueryTokensNoChildren);

  let mediaQueryObject = {};

  const mediaQueryChild = mediaQueryFrame.children.find((c) => c.name.match(/\d+/));

  if (!mediaQueryChild || !mediaQueryChild.name) {
    throw new Error(errorSetupMediaQueryTokensMissingProps);
  }

  const name = removeNonIntegerValues(camelize(mediaQueryChild.name));
  let mediaQueryValue = mediaQueryChild.absoluteBoundingBox.width;

  if (mediaQueryChild.children && mediaQueryChild.children.length > 0) {
    mediaQueryValue = mediaQueryChild.children[0].absoluteBoundingBox.width;
  }

  mediaQueryObject[name] = `${mediaQueryValue}px`;
}
