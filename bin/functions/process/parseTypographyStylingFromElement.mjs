import path from 'path';

import { roundColorValue } from '../helpers/roundColorValue.mjs';
import { getTokenMatch } from './getTokenMatch.mjs';

import { errorParseTypographyStylingFromElement } from '../../meta/errors.mjs';

/**
 * Parse typography CSS from "element" (Figma component)
 *
 * @exports
 * @async
 * @function
 * @param {object} element - Figma object representation of element/component
 * @param {number} remSize - HTML body REM size
 * @param {boolean} isTest - Check if this is test, in which case tokens need to be imported from a stable source
 * @returns {object} - Return object with CSS and imports
 * @throws {errorParseTypographyStylingFromElement} - Throws error if no element or remSize is provided
 */
export async function parseTypographyStylingFromElement(element, remSize, config, isTest = false) {
  if (!element || !remSize) throw new Error(errorParseTypographyStylingFromElement);
  // Dynamic imports
  const PATH = config.outputFolderTokens;
  console.log(path.join(`${process.cwd()}`, `${PATH}`, `colors.js`));
  const _colors = await import(path.join(`${process.cwd()}`, `${PATH}`, `colors.js`));
  const colors = _colors.default.colors;
  // const _fontFamilies = await import(path.join(`${process.cwd()}`, `${PATH}`, `fontFamilies.js`));
  // const fontFamilies = _fontFamilies.default;
  const _fontSizes = await import(path.join(`${process.cwd()}`, `${PATH}`, `fontSizes.js`));
  const fontSizes = _fontSizes.default;
  const _fontWeights = await import(path.join(`${process.cwd()}`, `${PATH}`, `fontWeights.js`));
  const fontWeights = _fontWeights.default;
  const _letterSpacings = await import(
    path.join(`${process.cwd()}`, `${PATH}`, `letterSpacings.js`)
  );
  const letterSpacings = _letterSpacings.default;
  const _lineHeights = await import(path.join(`${process.cwd()}`, `${PATH}`, `lineHeights.js`));
  const lineHeights = _lineHeights.default;

  let css = ``;
  let imports = [];

  const FONT_COLOR = (() => {
    if (element.fills) {
      if (element.fills[0]) {
        if (element.fills[0].type === 'SOLID') {
          const R = roundColorValue(element.fills[0].color.r);
          const G = roundColorValue(element.fills[0].color.g);
          const B = roundColorValue(element.fills[0].color.b);
          const A = roundColorValue(element.fills[0].color.a, 1);
          return `rgba(${R}, ${G}, ${B}, ${A})`;
        }
      }
    }
  })();

  if (FONT_COLOR) {
    const { updatedCss, updatedImports } = getTokenMatch(
      colors,
      'colors',
      'color',
      FONT_COLOR,
      remSize
    );
    css += updatedCss;
    updatedImports.forEach((i) => imports.push(i));
  }

  const FONT_SIZE = (() => {
    if (element.type === 'TEXT') {
      if (element.style) {
        return element.style.fontSize;
      }
    }
  })();

  if (FONT_SIZE) {
    const { updatedCss, updatedImports } = getTokenMatch(
      fontSizes,
      'fontSizes',
      'font-size',
      FONT_SIZE,
      remSize
    );
    css += updatedCss;
    updatedImports.forEach((i) => imports.push(i));
  }

  // BUG? Will only work correctly with Postscript name?
  // const FONT_FAMILY = (() => {
  //   if (element.type === 'TEXT') {
  //     if (element.style) {
  //       return element.style.fontPostScriptName; //fontFamily;
  //     }
  //   }
  // })();

  // if (FONT_FAMILY) {
  //   const { updatedCss, updatedImports } = getTokenMatch(
  //     fontFamilies,
  //     'fontFamilies',
  //     'font-family',
  //     FONT_FAMILY,
  //     remSize
  //   );
  //   css += updatedCss;
  //   updatedImports.forEach((i) => imports.push(i));
  // }

  const FONT_WEIGHT = (() => {
    if (element.type === 'TEXT') {
      if (element.style) {
        return element.style.fontWeight;
      }
    }
  })();

  if (FONT_WEIGHT) {
    const { updatedCss, updatedImports } = getTokenMatch(
      fontWeights,
      'fontWeights',
      'font-weight',
      FONT_WEIGHT,
      remSize
    );
    css += updatedCss;
    updatedImports.forEach((i) => imports.push(i));
  }

  const FONT_LINE_HEIGHT = (() => {
    if (element.type === 'TEXT') {
      if (element.style) {
        if (element.style.lineHeightPercentFontSize) {
          return element.style.lineHeightPercentFontSize / 100;
        } else return 1.0;
      }
    }
  })();

  if (FONT_LINE_HEIGHT) {
    const { updatedCss, updatedImports } = getTokenMatch(
      lineHeights,
      'lineHeights',
      'line-height',
      FONT_LINE_HEIGHT,
      remSize
    );
    css += updatedCss;
    updatedImports.forEach((i) => imports.push(i));
  }

  const FONT_ALIGNMENT = (() => {
    if (element.type === 'TEXT') {
      if (element.style) {
        return element.style.textAlignHorizontal;
      }
    }
  })();

  const LETTER_SPACING = (() => {
    if (element.type === 'TEXT') {
      if (element.style) {
        if (element.style.letterSpacing) {
          return element.style.letterSpacing;
        }
      }
    }
  })();

  if (LETTER_SPACING && FONT_SIZE) {
    const { updatedCss, updatedImports } = getTokenMatch(
      letterSpacings,
      'letterSpacings',
      'letter-spacing',
      // TODO: this duplicates the internal logic of the letter-spacing token processing, and makes the heavy assumption the expected unit is "em"
      `${LETTER_SPACING / FONT_SIZE}em`
    );
    css += updatedCss;
    updatedImports.forEach((i) => imports.push(i));
  }

  if (FONT_ALIGNMENT) {
    const ALIGNMENT = FONT_ALIGNMENT.toLowerCase();
    css += `text-align: ${ALIGNMENT};\n`;
  }

  const FONT_CASE = (() => {
    if (element.type === 'TEXT') {
      if (element.style) {
        if (element.style.textCase) {
          if (element.style.textCase === 'LOWER') return 'lowercase';
          if (element.style.textCase === 'UPPER') return 'uppercase';
          if (element.style.textCase === 'TITLE') return 'capitalize';
        }
      }
    }
  })();

  if (FONT_CASE) css += `text-transform: ${FONT_CASE};\n`;

  return { css, imports };
}
