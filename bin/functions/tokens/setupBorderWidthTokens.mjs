import { camelize } from '../helpers/camelize.mjs';

import {
  errorSetupBorderWidthTokensNoFrame,
  errorSetupBorderWidthTokensNoChildren,
  errorSetupBorderWidthTokensMissingProps
} from '../../meta/errors.mjs';

/**
 * Places all Figma border widths into a clean object
 *
 * @exports
 * @function
 * @param {object} borderWidthFrame - The border widths frame from Figma
 * @returns {object} - Returns an object with all the border widths
 * @throws {errorSetupBorderWidthTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupBorderWidthTokensNoChildren} - When Figma frame is missing children
 */
export function setupBorderWidthTokens(borderWidthFrame) {
  if (!borderWidthFrame) throw new Error(errorSetupBorderWidthTokensNoFrame);
  if (!borderWidthFrame.children) throw new Error(errorSetupBorderWidthTokensNoChildren);

  let borderWidthObject = {};

  const borderChild = borderWidthFrame.children.find((c) => c.name.match(/\d+/));
  if (!borderChild.name || typeof borderChild.strokeWeight === 'undefined') {
    throw new Error(errorSetupBorderWidthTokensMissingProps);
  }

  const name = camelize(borderChild.name);

  borderWidthObject[name] = `${parseInt(borderChild.strokeWeight, 10)}px`;

  return borderWidthObject;
}
