import { camelize } from '../helpers/camelize.mjs';

import {
  errorSetupDurationTokensNoFrame,
  errorSetupDurationTokensNoChildren,
  errorSetupDurationTokensMissingProps
} from '../../meta/errors.mjs';

/**
 * Places all Figma durations into a clean object
 *
 * @exports
 * @function
 * @param {object} durationFrame - The durations frame from Figma
 * @returns {object} - Returns an object with all the animation duration values
 * @throws {errorSetupDurationTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupDurationTokensNoChildren} - When no children in Figma frame
 * @throws {errorSetupDurationTokensMissingProps} - When missing required props in children
 */
export function setupDurationTokens(durationFrame) {
  if (!durationFrame) throw new Error(errorSetupDurationTokensNoFrame);
  if (!durationFrame.children) throw new Error(errorSetupDurationTokensNoChildren);

  const durationObj = {};

  const durationChild = durationFrame.children.find((c) => c.name.match(/\d+/));

  if (!durationChild.children[0].characters || !durationChild.name) {
    throw new Error(errorSetupDurationTokensMissingProps);
  }

  const name = camelize(durationChild.name);
  const durationValue = durationChild.children[0].characters;

  durationObj[name] = durationValue;

  return durationObj;
}
