import { setupColorTokens } from '../tokens/setupColorTokens.mjs';
import { setupSpacingTokens } from '../tokens/setupSpacingTokens.mjs';
import { setupFontTokens } from '../tokens/setupFontTokens.mjs';
import { setupFontSizeTokens } from '../tokens/setupFontSizeTokens.mjs';
import { setupFontWeightTokens } from '../tokens/setupFontWeightTokens.mjs';
import { setupLineHeightTokens } from '../tokens/setupLineHeightTokens.mjs';
import { setupShadowTokens } from '../tokens/setupShadowTokens.mjs';
import { setupBorderWidthTokens } from '../tokens/setupBorderWidthTokens.mjs';
import { setupRadiusTokens } from '../tokens/setupRadiusTokens.mjs';
import { setupZindexTokens } from '../tokens/setupZindexTokens.mjs';
import { setupLetterSpacingTokens } from '../tokens/setupLetterSpacingTokens.mjs';
import { setupMediaQueryTokens } from '../tokens/setupMediaQueryTokens.mjs';
import { setupOpacitiesTokens } from '../tokens/setupOpacitiesTokens.mjs';
import { setupDurationTokens } from '../tokens/setupDurationTokens.mjs';
import { setupDelayTokens } from '../tokens/setupDelayTokens.mjs';
import { setupEasingTokens } from '../tokens/setupEasingTokens.mjs';

import { errorProcessTokens, errorProcessTokensNoConfig } from '../../meta/errors.mjs';
import { ignoreElementsKeywords } from '../../meta/ignoreElementsKeywords.mjs';

export const aliasMapping = [
  {
    name: 'borderWidths',
    alias: ['breiten', 'borderwidth', 'borderwidths']
  },
  {
    name: 'colors',
    alias: ['palette', 'color', 'colors', 'colour', 'colours']
  },
  {
    name: 'fontFamily',
    alias: ['fontfamily', 'fontfamilies']
  },
  {
    name: 'fontSizes',
    alias: ['fontsize', 'fontsizes']
  },
  {
    name: 'fontWeights',
    alias: ['fontweight', 'fontweights']
  },
  {
    name: 'letterSpacings',
    alias: ['letterspacing', 'letterspacings']
  },
  {
    name: 'lineHeights',
    alias: ['lineheight', 'lineheights']
  },
  {
    name: 'mediaQueries',
    alias: ['mediaquery', 'mediaqueries']
  },
  {
    name: 'opacities',
    alias: ['opacity', 'opacities']
  },
  {
    name: 'radii',
    alias: ['radius', 'radii']
  },
  {
    name: 'shadows',
    alias: ['schatten', 'shadow', 'shadows']
  },
  {
    name: 'spacings',
    alias: ['abstaende', 'space', 'spaces', 'spacing', 'spacings']
  },
  {
    name: 'zindices',
    alias: ['zindex', 'zindices']
  },
  {
    name: 'durations',
    alias: [
      'transitions',
      'duration',
      'durations',
      'animation duration',
      'animation durations',
      'motion duration',
      'motion durations'
    ]
  },
  {
    name: 'delays',
    alias: [
      'delay',
      'delays',
      'animation delay',
      'animation delays',
      'motion delay',
      'motion delays'
    ]
  },
  {
    name: 'easing',
    alias: ['easing', 'animation easing', 'motion easing']
  }
];
const processGroup = ({ name, sheet, config }) => {
  let processedTokens = undefined;

  switch (name) {
    case 'borderWidths': {
      processedTokens = setupBorderWidthTokens(sheet);
      break;
    }
    case 'colors': {
      processedTokens = setupColorTokens(sheet);
      break;
    }
    case 'fontFamily': {
      if (!config) throw new Error(errorProcessTokensNoConfig);
      processedTokens = setupFontTokens(sheet, config.usePostscriptFontNames);
      break;
    }
    case 'fontSizes': {
      if (!config) throw new Error(errorProcessTokensNoConfig);
      processedTokens = setupFontSizeTokens(sheet, config.fontUnit, config.remSize);
      break;
    }
    case 'fontWeights': {
      processedTokens = setupFontWeightTokens(sheet);
      break;
    }
    case 'letterSpacings': {
      if (!config) throw new Error(errorProcessTokensNoConfig);
      processedTokens = setupLetterSpacingTokens(sheet, config.letterSpacingUnit);
      break;
    }
    case 'lineHeights': {
      processedTokens = setupLineHeightTokens(sheet);
      break;
    }
    case 'mediaQueries': {
      processedTokens = setupMediaQueryTokens(sheet);
      break;
    }
    case 'opacities': {
      if (!config) throw new Error(errorProcessTokensNoConfig);
      processedTokens = setupOpacitiesTokens(sheet, config.opacitiesUnit);
      break;
    }
    case 'radii': {
      processedTokens = setupRadiusTokens(sheet);
      break;
    }
    case 'shadows': {
      processedTokens = setupShadowTokens(sheet);
      break;
    }
    case 'spacings': {
      if (!config) throw new Error(errorProcessTokensNoConfig);
      processedTokens = setupSpacingTokens(sheet, config.spacingUnit, config.remSize);
      break;
    }
    case 'zindices': {
      processedTokens = setupZindexTokens(sheet);
      break;
    }
    case 'durations': {
      processedTokens = setupDurationTokens(sheet);
      break;
    }
    case 'delays': {
      processedTokens = setupDelayTokens(sheet);
      break;
    }
    case 'easing': {
      processedTokens = setupEasingTokens(sheet);
      break;
    }
  }

  return Object.entries(processedTokens).reduce((res, [key, value]) => {
    res[key] = { value };
    return res;
  }, {});
};

const filterSheetChildren = (sheetChildren) => {
  return [...sheetChildren].filter((item) => {
    let shouldInclude = true;
    for (let i = 0; i < ignoreElementsKeywords.length; i++) {
      const keywordToIgnore = ignoreElementsKeywords[i];

      if (item.name.toLowerCase().indexOf(keywordToIgnore) >= 0) {
        shouldInclude = false;
        break;
      }
    }

    return shouldInclude;
  });
};
/**
 * Process tokens
 *
 * @exports
 * @function
 * @param {object} sheet - Sheet object from Figma
 * @param {string} name - Token name
 * @param {object} [config] - User configuration object
 * @returns {object} - returns object with design tokens
 * @throws {errorProcessTokens} - When missing sheet or name
 * @throws {errorProcessTokensNoConfig} - When missing config, required for certain processing
 */
export function processTokens(sheet, name, config) {
  if (!sheet || !name) throw new Error(errorProcessTokens);

  // Filter out elements that contain ignore keywords in their name
  const filteredSheet = { ...sheet, children: filterSheetChildren(sheet.children) };
  const groups = filteredSheet.children.filter((item) => item.type === 'GROUP');
  const _NAME = aliasMapping.find((item) => {
    return item.alias.includes(name.toLowerCase());
  }).name;

  if (!groups.length) {
    return { [_NAME]: processGroup({ name: _NAME, sheet: filteredSheet, config }) };
  }

  let tokenGroups = {};

  groups.forEach((groupSheet) => {
    const _NAME = aliasMapping.find((item) => {
      return item.alias.includes(name.toLowerCase());
    }).name;
    tokenGroups = {
      ...tokenGroups,
      [groupSheet.name.replace('group-', '')]: processGroup({
        name: _NAME,
        sheet: groupSheet,
        config
      })
    };
  });
  return { [_NAME]: tokenGroups };
}
