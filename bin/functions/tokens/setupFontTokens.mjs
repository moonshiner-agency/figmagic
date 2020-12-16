import { camelize } from '../helpers/camelize.mjs';

import {
  errorSetupFontTokensNoFrame,
  errorSetupFontTokensNoChildren,
  errorSetupFontTokensMissingProps,
  errorSetupFontSizeTokensNoSizing
} from '../../meta/errors.mjs';

/**
 * Places all Figma fonts into a clean object
 *
 * @exports
 * @function
 * @param {object} fontFrame - The font frame from Figma
 * @param {boolean} usePostscriptFontNames - Boolean to decide if to use Postscript font names or the default font family names (without spaces)
 * @returns {object} - Returns an object with all the fonts
 * @throws {errorSetupFontTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupFontTokensNoChildren} - When Figma frame is missing children
 * @throws {errorSetupFontTokensMissingProps} - When missing required props on frame children
 */
export function setupFontTokens(fontFrame, fontUnit, remSize) {
  if (!fontFrame) throw new Error(errorSetupFontTokensNoFrame);
  if (!fontFrame.children) throw new Error(errorSetupFontTokensNoChildren);
  if (!fontUnit || !remSize) throw new Error(errorSetupFontSizeTokensNoSizing);

  let fontObject = {};

  fontFrame.children.forEach((c) => {
    if (!c.name) throw new Error(errorSetupFontTokensMissingProps);

    const slice = c.name.match(/size=(\d+)(.+=(\w*))?/);
    if (slice) {
      const name = slice[1];
      const styleChild = c.children[0];
      const size = styleChild.style.fontSize / remSize + fontUnit;
      const weight = styleChild.style.fontWeight;
      const letterSpacing = styleChild.style.letterSpacing / remSize + fontUnit;
      const lineHeight = styleChild.style.lineHeightPx / remSize + fontUnit;

      fontObject[name] = size;

      // TODO: cant be parsed like that by StyleDictionary

      // if (!fontObject[name]) {
      //   fontObject[name] = {};
      // }
      // if (slice[3]) {
      //   const weightName = slice[3];
      //   fontObject[name][weightName] = {
      //     size,
      //     weight,
      //     letterSpacing,
      //     lineHeight
      //   };
      // } else {
      //   fontObject[name] = {
      //     size,
      //     weight,
      //     letterSpacing,
      //     lineHeight
      //   };
      // }
    }
  });

  return fontObject;
}
