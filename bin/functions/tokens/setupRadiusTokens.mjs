import { camelize } from '../helpers/camelize.mjs';
import { normalizeUnits } from '../helpers/normalizeUnits.mjs';

import {
  errorSetupRadiusTokensNoFrame,
  errorSetupRadiusTokensNoChildren
} from '../../meta/errors.mjs';

/**
 * Places all Figma radii into a clean object
 *
 * @exports
 * @function
 * @param {object} radiusFrame - The radii frame from Figma
 * @returns {object} - Returns an object with all the radii
 * @throws {errorSetupRadiusTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupRadiusTokensNoChildren} - When missing children in Figma frame
 * @throws {errorSetupRadiusTokensMissingProps} - When missing required props in frame children
 */
export function setupRadiusTokens(radiusFrame) {
  if (!radiusFrame) throw new Error(errorSetupRadiusTokensNoFrame);
  if (!radiusFrame.children) throw new Error(errorSetupRadiusTokensNoChildren);

  let cornerRadiusObject = {};

  const radiusChild = radiusFrame.children.find((c) => c.name.match(/\d+/));
  const name = camelize(radiusChild.name);

  const RADIUS = (() => {
    if (radiusChild.cornerRadius)
      return normalizeUnits(radiusChild.cornerRadius, 'cornerRadius', 'adjustedRadius');
    else return `0px`;
  })();

  cornerRadiusObject[name] = RADIUS;

  return cornerRadiusObject;
}
