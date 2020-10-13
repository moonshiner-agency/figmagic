import { errorParseCliArgs } from '../../meta/errors.mjs';

import {
  warnParseCliArgsOutputFormat,
  warnParseCliArgsFontUnit,
  warnParseCliArgsOpacitiesUnit,
  warnParseCliArgsLetterSpacingUnit,
  warnParseCliArgsSpacingUnit
} from '../../meta/warnings.mjs';

import { defaultConfig } from '../../meta/config.mjs';

/**
 * Parse CLI arguments and return config object
 *
 * @exports
 * @function
 * @param {array} argsArray - Array of string arguments
 * @returns {object} - Returns config object
 * @throws {errorParseCliArgs} - Throws error if no arguments array is provided
 */
export function parseCliArgs(argsArray) {
  if (!argsArray) throw new Error(errorParseCliArgs);

  let config = {};

  if (argsArray.length > 0) {
    config = argsArray.reduce(
      // reducer: add specific keys to the accumulated config when known arguments match
      (accumulatedConfig, arg, index) => {
        switch (arg) {
          // provide token page names of figma documents to parse
          case '--tokenPages':
            accumulatedConfig.tokenPages = argsArray[index + 1];
            break;
          // provide token page names of figma documents to parse
          case '--graphicPages':
            accumulatedConfig.graphicPages = argsArray[index + 1];
            break;
          case '--elementPages':
            accumulatedConfig.elementPages = argsArray[index + 1];
            break;
          case '--descriptionPages':
            accumulatedConfig.descriptionPages = argsArray[index + 1];
            break;
          case '--descriptionTags':
            accumulatedConfig.descriptionTags = argsArray[index + 1];
            break;
          // Toggle debug mode if requested
          case '--debug':
            accumulatedConfig.debugMode = true;
            break;
          case '--removeOld':
            accumulatedConfig.removeOld = true;
            break;
          // Recompile tokens from local Figma JSON file
          case '--recompileLocal':
            accumulatedConfig.recompileLocal = true;
            break;
          // Sync graphics from "Graphics" page in Figma
          case '--syncGraphics':
            accumulatedConfig.syncGraphics = true;
            break;
          case '--graphicConfig':
            accumulatedConfig.graphicConfig = argsArray[index + 1];
            break;
          // Sync elements from "Elements" page in Figma
          case '--syncElements':
            accumulatedConfig.syncElements = true;
            break;
          case '--syncDescriptions':
            accumulatedConfig.syncDescriptions = true;
            break;
          // Skip file generation: React
          case '--skipReact':
            accumulatedConfig.skipFileGeneration = {
              ...accumulatedConfig.skipFileGeneration,
              react: true
            };
            break;
          // Skip file generation: Styled Components
          case '--skipStyled':
            accumulatedConfig.skipFileGeneration = {
              ...accumulatedConfig.skipFileGeneration,
              styled: true
            };
            break;
          // Skip file generation: CSS
          case '--skipCss':
            accumulatedConfig.skipFileGeneration = {
              ...accumulatedConfig.skipFileGeneration,
              css: true
            };
            break;
          // Skip file generation: Storybook
          case '--skipStorybook':
            accumulatedConfig.skipFileGeneration = {
              ...accumulatedConfig.skipFileGeneration,
              storybook: true
            };
            break;
          // Force update all elements
          case '--forceUpdate':
            accumulatedConfig.skipFileGeneration = {
              ...accumulatedConfig.skipFileGeneration,
              forceUpdate: true
            };
            break;
          // Check and handle token format switch
          case '--outputTokenFormat':
          case '-tf': {
            let outputTokenFormat = argsArray[index + 1].toLowerCase();
            if (!['mjs', 'js'].includes(outputTokenFormat)) {
              console.warn(warnParseCliArgsOutputFormat);
              outputTokenFormat = defaultConfig.outputTokenFormat;
            }
            accumulatedConfig.outputTokenFormat = outputTokenFormat;
            break;
          }
          case '--outputDescriptionFormat': {
            let outputDescriptionFormat = argsArray[index + 1].toLowerCase();
            accumulatedConfig.outputDescriptionFormat = outputDescriptionFormat;
            break;
          }
          // Check and handle font unit switch
          case '--fontUnit':
          case '-f': {
            let fontUnit = argsArray[index + 1].toLowerCase();
            if (!['rem', 'em'].includes(fontUnit)) {
              console.warn(warnParseCliArgsFontUnit);
              fontUnit = defaultConfig.fontUnit;
            }
            accumulatedConfig.fontUnit = fontUnit;
            break;
          }
          // Check and handle letter-spacing unit switch
          case '--letterSpacingUnit':
          case '-lsu': {
            let letterSpacingUnit = argsArray[index + 1].toLowerCase();
            if (!['em', 'px'].includes(letterSpacingUnit)) {
              console.warn(warnParseCliArgsLetterSpacingUnit);
              letterSpacingUnit = defaultConfig.letterSpacingUnit;
            }
            accumulatedConfig.letterSpacingUnit = letterSpacingUnit;
            break;
          }
          // Check and handle opacities unit switch
          case '--opacitiesUnit':
          case '-ou': {
            let opacitiesUnit = argsArray[index + 1].toLowerCase();
            if (!['float', 'percent'].includes(opacitiesUnit)) {
              console.warn(warnParseCliArgsOpacitiesUnit);
              opacitiesUnit = defaultConfig.opacitiesUnit;
            }
            accumulatedConfig.opacitiesUnit = opacitiesUnit;
            break;
          }
          // Check and handle spacing unit switch
          case '--spacingUnit':
          case '-s': {
            let spacingUnit = argsArray[index + 1].toLowerCase();
            if (!['rem', 'em'].includes(spacingUnit)) {
              console.warn(warnParseCliArgsSpacingUnit);
              spacingUnit = defaultConfig.spacingUnit;
            }
            accumulatedConfig.spacingUnit = spacingUnit;
            break;
          }
          // Handle input: Figma API token
          case '--token':
          case '-t':
            accumulatedConfig.token = argsArray[index + 1];
            break;
          // Handle input: Figma URL
          case '--url':
          case '-u':
            accumulatedConfig.url = argsArray[index + 1];
            break;
          // Handle input: Figma base file output folder
          case '--outputFolderBaseFile':
          case '-base':
            accumulatedConfig.outputFolderBaseFile = argsArray[index + 1];
            break;
          // Handle input: token output folder
          case '--outputFolderTokens':
          case '-tokens':
            accumulatedConfig.outputFolderTokens = argsArray[index + 1];
            break;
          case '--outputFolderDescriptions':
          case '-description':
            accumulatedConfig.outputFolderDescriptions = argsArray[index + 1];
            break;
          case '--outputFolderGraphics':
          case '-graphics':
            accumulatedConfig.outputFolderGraphics = argsArray[index + 1];
            break;
          // Handle input: element output folder
          case '--outputFolderElements':
          case '-elements':
            accumulatedConfig.outputFolderElements = argsArray[index + 1];
            break;
          // Handle input: component output folder
          /*
          case '--outputFolderComponents':
          case '-components':
            accumulatedConfig.outputFolderComponents = argsArray[index + 1];
            break;
          */
          // Handle input: output file name
          case '--outputFileName':
          case '-file':
            accumulatedConfig.outputFileName = argsArray[index + 1];
            break;
          // Handle input: output token data type
          case '--outputTokenDataType':
          case '-tokentype':
            accumulatedConfig.outputTokenDataType = argsArray[index + 1];
            break;
          // Set font family name to be "common name" or Postscript name
          case '--usePostscriptFontNames':
          case '-ps':
            accumulatedConfig.usePostscriptFontNames = true;
            break;
          // Set custom template path for React
          case '--templatePathReact':
            accumulatedConfig.templates = {
              ...accumulatedConfig.templates,
              templatePathReact: argsArray[index + 1]
            };
            break;
          // Set custom template path for Styled Components
          case '--templatePathStyled':
            accumulatedConfig.templates = {
              ...accumulatedConfig.templates,
              templatePathStyled: argsArray[index + 1]
            };
            break;
          // Set custom template path for Storybook
          case '--templatePathStorybook':
            accumulatedConfig.templates = {
              ...accumulatedConfig.templates,
              templatePathStorybook: argsArray[index + 1]
            };
            break;
        }

        return accumulatedConfig;
      },
      // initial object: empty config
      {}
    );
  }

  return config;
}
