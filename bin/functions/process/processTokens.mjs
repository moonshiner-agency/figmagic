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
import { tokenAliasMapping } from '../../meta/aliasMapping.mjs';
import { camelize } from '../helpers/camelize.mjs';

const processGroup = ({ name, sheet, config }) => {
  let processedTokens = undefined;

  switch (name) {
    case 'borderWidth':
    case 'width': {
      processedTokens = setupBorderWidthTokens(sheet);
      break;
    }
    case 'color':
    case 'colors': {
      processedTokens = setupColorTokens(sheet);
      break;
    }
    case 'copy':
    case 'heading': {
      if (!config) throw new Error(errorProcessTokensNoConfig);
      processedTokens = setupFontTokens(sheet, config.fontUnit, config.remSize);
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
    case 'breakpoint':
    case 'breakpoints':
    case 'mediaQueries': {
      processedTokens = setupMediaQueryTokens(sheet);
      break;
    }
    case 'opacities': {
      if (!config) throw new Error(errorProcessTokensNoConfig);
      processedTokens = setupOpacitiesTokens(sheet, config.opacitiesUnit);
      break;
    }
    case 'radius': {
      processedTokens = setupRadiusTokens(sheet);
      break;
    }
    case 'shadow':
    case 'shadows': {
      processedTokens = setupShadowTokens(sheet);
      break;
    }
    case 'space':
    case 'spacings': {
      if (!config) throw new Error(errorProcessTokensNoConfig);
      processedTokens = setupSpacingTokens(sheet, config.spacingUnit, config.remSize);
      break;
    }
    case 'zindices': {
      processedTokens = setupZindexTokens(sheet);
      break;
    }
    case 'duration':
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
  const groups = filteredSheet.children.filter(
    (item) => item.type === 'GROUP' || item.name.includes('group')
  );
  const _NAME = tokenAliasMapping.find((item) => {
    return item.alias.includes(name.toLowerCase());
  }).name;

  console.log(_NAME, name);
  if (!groups.length) {
    return { [_NAME]: processGroup({ name: _NAME, sheet: filteredSheet, config }) };
  }

  let tokenGroups = {};

  groups.forEach((groupSheet) => {
    const _NAME = tokenAliasMapping.find((item) => {
      return item.alias.includes(name.toLowerCase());
    }).name;

    const groupName = camelize([...groupSheet.name.matchAll(/(^\w+-)(\w+)/g)][0][2]);
    const group = processGroup({
      name: _NAME,
      sheet: groupSheet,
      config
    });
    if (_NAME.includes(groupName) || !isNaN(parseInt(groupName))) {
      tokenGroups = {
        ...tokenGroups,
        ...group
      };
    } else {
      tokenGroups = {
        ...tokenGroups,
        [groupName]: group
      };
    }
  });
  return { [_NAME]: tokenGroups };
}
