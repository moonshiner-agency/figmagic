import { camelize } from '../helpers/camelize.mjs';

import {
  errorSetupGenericTokensNoFrame,
  errorSetupGenericTokensNoChildren,
  errorSetupGenericTokensMissingProps
} from '../../meta/errors.mjs';

/**
 * Places all Figma durations into a clean object
 *
 * @exports
 * @function
 * @param {object} genericFrame - A generic frame from Figma
 * @returns {object} - Returns an object with all the extracted generic values
 * @throws {errorSetupDurationTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupDurationTokensNoChildren} - When no children in Figma frame
 * @throws {errorSetupDurationTokensMissingProps} - When missing required props in children
 */
export function setupGenericTokens(genericFrame) {
  if (!genericFrame) throw new Error(errorSetupGenericTokensNoFrame);
  if (!genericFrame.children) throw new Error(errorSetupGenericTokensNoChildren);

  let genericObject = {};

  genericFrame.children.forEach((type) => {
    if (!type.name || !type.characters) throw new Error(errorSetupGenericTokensMissingProps);
    const name = camelize(type.name);
    genericObject[name] = type.characters;
  });
  return genericObject;
}
