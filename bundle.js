'use strict';

var path = require('path');
var trash = require('trash');
var fs = require('fs');
var fetch = require('node-fetch');
var marked = require('marked');
var sanitizeHtml = require('sanitize-html');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

var path__default = /*#__PURE__*/ _interopDefaultLegacy(path);
var trash__default = /*#__PURE__*/ _interopDefaultLegacy(trash);
var fs__default = /*#__PURE__*/ _interopDefaultLegacy(fs);
var fetch__default = /*#__PURE__*/ _interopDefaultLegacy(fetch);
var marked__default = /*#__PURE__*/ _interopDefaultLegacy(marked);
var sanitizeHtml__default = /*#__PURE__*/ _interopDefaultLegacy(sanitizeHtml);

const colors = {
  BgBlack: '\x1b[40m',
  BgBlue: '\x1b[44m',
  BgCyan: '\x1b[46m',
  BgGreen: '\x1b[42m',
  BgMagenta: '\x1b[45m',
  BgRed: '\x1b[41m',
  BgWhite: '\x1b[47m',
  BgYellow: '\x1b[43m',

  FgBlack: '\x1b[30m',
  FgBlue: '\x1b[34m',
  FgCyan: '\x1b[36m',
  FgGreen: '\x1b[32m',
  FgMagenta: '\x1b[35m',
  FgRed: '\x1b[31m',
  FgWhite: '\x1b[37m',
  FgYellow: '\x1b[33m',

  Blink: '\x1b[5m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Hidden: '\x1b[8m',
  Reset: '\x1b[0m',
  Reverse: '\x1b[7m',
  Underscore: '\x1b[4m'
};

// Thanks to: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
// Also refer to: https://en.wikipedia.org/wiki/ANSI_escape_code#Colors

const errorCamelize = `${colors.FgRed}No string provided to camelize()!`;
const errorCreateConfiguration = `${colors.FgRed}No path provided to createConfiguration()!`;
const errorCreateEnumStringOutOfObject = `${colors.FgRed}No object provided to createEnumStringOutOfObject()!`;
const errorCreateFolder = `${colors.FgRed}No directory specified for createFolder()!`;
const errorCreateImportStringFromList = `${colors.FgRed}No "importArray" provided to createImportStringFromList()!`;
const errorCreateImportStringFromListZeroLength = `${colors.FgRed}Provided "importArray" is zero-length when calling createImportStringFromList()!`;
const errorCreatePage = `${colors.FgRed}No pages provided to createPage()!`;
const errorDownloadFile = `${colors.FgRed}Missing one or more of "url", "folder", or "file" arguments in downloadFile()!`;
const errorGetData = `${colors.FgRed}Could not retrieve any data. Are you missing a valid API key?`;
const errorGetFileList = `${colors.FgRed}Missing one or more of required arguments: "imageResponse", "ids" and/or "outputFormatGraphics" when calling getFileList()!`;
const errorGetFromApi = `${colors.FgRed}Missing one or more of required arguments: "figmaToken", "figmaUrl" when attempting to get data from Figma API!`;
const errorGetIds = `${colors.FgRed}No (or zero-length) array passed to getIds()!`;
const errorLoadFile = (path) => `${colors.FgRed}Could not find file: ${path}!`;
const errorNormalizeUnits = `${colors.FgRed}Missing parameters for normalizeUnits()!`;
const errorNormalizeUnitsNoRemSize = `${colors.FgRed}Missing required "remSize" argument for normalizeUnits() when converting to rem/em!`;
const errorNormalizeUnitsUndefined = `${colors.FgRed}Parameters "rootSize" or "unitSize" are undefined!`;
const errorParseCliArgs = `${colors.FgRed}No arguments array passed to parseCliArgs()!`;
const errorPrepareWrite = `${colors.FgRed}No templates provided to prepareWrite()! Seems like fallback template path also failed...`;
const errorProcessGraphics = `${colors.FgRed}Graphics page is undefined or empty! Make sure you have defined graphic pages via cli argument --graphicPages.`;
const errorProcessGraphicsImageError = `${colors.FgRed}Error when fetching graphics from Figma API!`;
const errorProcessGraphicsNoImages = `${colors.FgRed}No images received from Figma API!`;
const errorProcessTokens = `${colors.FgRed}No sheet or name for processTokens()!`;
const errorProcessTokensNoConfig = `${colors.FgRed}No config provided to processTokens()!`;
const errorProcessDescriptions = `${colors.FgRed}No sheet or name for processDescriptions()!`;
const errorProcessDescriptionsNoConfig = `${colors.FgRed}No config provided to processDescriptions()!`;
const errorRoundColorValue = `${colors.FgRed}Error while rounding color value: Scale value must be equal to or less than 255!`;
const errorSetupBorderWidthTokensMissingProps = `${colors.FgRed}Missing "name" or "strokeWeight" properties in border width frame!`;
const errorSetupBorderWidthTokensNoChildren = `${colors.FgRed}Border Width has no children!`;
const errorSetupBorderWidthTokensNoFrame = `${colors.FgRed}No frame for setupBorderWidthTokens()!`;
const errorSetupColorTokensNoChildren = `${colors.FgRed}Color tokens frame has no children!`;
const errorSetupColorTokensNoFills = `${colors.FgRed}Color has no "fills" property!`;
const errorSetupColorTokensNoFrame = `${colors.FgRed}No frame for setupColorTokens()!`;
const errorSetupFontSizeTokensMissingProps = `${colors.FgRed}Missing "name" or "style" properties in font sizes frame!`;
const errorSetupFontSizeTokensMissingSize = `${colors.FgRed}Missing required "style.fontSize" property!`;
const errorSetupFontSizeTokensNoChildren = `${colors.FgRed}Font size frame is missing "children" array!`;
const errorSetupFontSizeTokensNoFrame = `${colors.FgRed}No frame for setupFontSizeTokens()!`;
const errorSetupFontSizeTokensNoSizing = `${colors.FgRed}Missing "fontUnit" or "remSize" properties when calling setupFontSizeTokens()!`;
const errorSetupFontTokensMissingProps = `${colors.FgRed}Missing "name" or "style" properties in font tokens frame!`;
const errorSetupFontTokensNoChildren = `${colors.FgRed}Font tokens frame is missing "children" array!`;
const errorSetupFontTokensNoFrame = `${colors.FgRed}No frame for setupFontTokens()!`;
const errorSetupFontWeightTokensMissingProps = `${colors.FgRed}Missing "name" or "style" properties in font weights frame!`;
const errorSetupFontWeightTokensMissingWeight = `${colors.FgRed}Missing required "style.fontWeight" property!`;
const errorSetupFontWeightTokensNoChildren = `${colors.FgRed}Font weights frame is missing "children" array!`;
const errorSetupFontWeightTokensNoFrame = `${colors.FgRed}No frame for setupFontWeightTokens()!`;
const errorSetupLetterSpacingTokensMissingProps = `${colors.FgRed}Missing "name" or "style" properties in letter spacing frame!`;
const errorSetupLetterSpacingTokensNoChildren = `${colors.FgRed}Letter Spacing frame has no children!`;
const errorSetupLetterSpacingTokensNoFrame = `${colors.FgRed}No frame for setupLetterSpacingTokens()!`;
const errorSetupLineHeightTokensMissingPercent = `${colors.FgRed}Missing "style.lineHeightPercentFontSize" property in line heights frame!`;
const errorSetupLineHeightTokensMissingProps = `${colors.FgRed}Missing "name" or "style" properties in line heights frame!`;
const errorSetupLineHeightTokensNoChildren = `${colors.FgRed}Line heights frame has no children!`;
const errorSetupLineHeightTokensNoFrame = `${colors.FgRed}No frame for setupLineHeightTokens()!`;
const errorSetupMediaQueryTokensMissingProps = `${colors.FgRed}Missing "absoluteBoundingBox" property in media query frame!`;
const errorSetupMediaQueryTokensNoChildren = `${colors.FgRed}Media Query frame has no children!`;
const errorSetupMediaQueryTokensNoFrame = `${colors.FgRed}No frame for setupMediaQueryTokens()!`;
const errorSetupOpacitiesTokensMissingProps = `${colors.FgRed}Missing "name" or "characters" properties in opacities frame!`;
const errorSetupOpacitiesTokensNoChildren = `${colors.FgRed}Opacities frame has no children!`;
const errorSetupOpacitiesTokensNoFrame = `${colors.FgRed}No frame for setupOpacitiesTokens()!`;
const errorSetupRadiusTokensNoChildren = `${colors.FgRed}Radius frame has no children!`;
const errorSetupRadiusTokensNoFrame = `${colors.FgRed}No frame for setupRadiusTokens()!`;
const errorSetupShadowTokensMissingProps = `${colors.FgRed}Missing "effects" property in shadow frame!`;
const errorSetupShadowTokensNoChildren = `${colors.FgRed}Shadow frame has no children!`;
const errorSetupShadowTokensNoFrame = `${colors.FgRed}No frame for setupShadowTokens()!`;
const errorSetupSpacingTokensNoChildren = `${colors.FgRed}Spacing frame has no children!`;
const errorSetupSpacingTokensNoFrame = `${colors.FgRed}No frame for setupSpacingTokens()!`;
const errorSetupSpacingTokensNoUnits = `${colors.FgRed}Missing "spacingUnit" or "remSize" properties when calling setupSpacingTokens()!`;
const errorSetupZindexTokensMissingProps = `${colors.FgRed}Missing "name" or "characters" properties in Z index frame!`;
const errorSetupZindexTokensNoChildren = `${colors.FgRed}Z Index frame has no children!`;
const errorSetupZindexTokensNoFrame = `${colors.FgRed}No frame for setupZindexTokens()!`;
const errorSetupDurationTokensMissingProps = `${colors.FgRed}Missing "name" or "characters" properties in Duration frame!`;
const errorSetupDurationTokensNoChildren = `${colors.FgRed}Duration frame has no children!`;
const errorSetupDurationTokensNoFrame = `${colors.FgRed}No frame for setupDurationTokens()!`;
const errorSetupDelayTokensMissingProps = `${colors.FgRed}Missing "name" or "characters" properties in Delay frame!`;
const errorSetupDelayTokensNoChildren = `${colors.FgRed}Delay frame has no children!`;
const errorSetupDelayTokensNoFrame = `${colors.FgRed}No frame for setupDelayTokens()!`;
const errorSetupEasingTokensMissingProps = `${colors.FgRed}Missing "name" or "characters" properties in Easing frame!`;
const errorSetupEasingTokensNoChildren = `${colors.FgRed}Easing frame has no children!`;
const errorSetupEasingTokensNoFrame = `${colors.FgRed}No frame for setupEasingTokens()!`;
const errorWriteFile = `${colors.FgRed}Missing required parameters to correctly run writeFile()!`;
const errorWriteFileWrongType = `${colors.FgRed}Provided invalid file type to writeFile()!`;
const errorWriteGraphics = `${colors.FgRed}Missing "fileList" and/or "config" argument when calling writeGraphics()!`;
const errorWriteTokens = `${colors.FgRed}Less than one token provided to writeTokens()! Make sure you have defined token pages via cli argument --tokenPages.`;
const errorWriteTokensNoSettings = `${colors.FgRed}Missing "settings" argument/object when attempting to write tokens!`;
const errorWriteDescription = `${colors.FgRed}Less than one description provided to writeDescription()!`;
const errorWriteDescriptionNoSettings = `${colors.FgRed}Missing "settings" argument/object when attempting to write token description!`;

/**
 * Load file from local path
 *
 * @exports
 * @async
 * @function
 * @param {string} path - Path to local file
 * @param {boolean} [isRaw] - Bool to set if data should be parsed or not
 * @returns {Promise} - The parsed JSON object
 * @throws {errorLoadFile} - Throws error if no path
 * @throws {errorLoadFile} - Throws error if path does not exist
 */
async function loadFile(path, isRaw = false) {
  if (!path) throw new Error(errorLoadFile(path));
  if (!fs__default['default'].existsSync(path)) throw new Error(errorLoadFile(path));

  try {
    return await new Promise((resolve, reject) => {
      fs__default['default'].readFile(path, 'utf8', (error, data) => {
        if (error) reject(error);
        if (isRaw) {
          resolve(data);
          return data;
        }

        const DATA = JSON.parse(data);
        resolve(DATA);
      });
    });
  } catch (error) {
    console.error(error);
  }
}

const warnParseCliArgsFontUnit = `${colors.FgYellow}Received unrecognized "fontUnit" argument, it must be "rem" (default) or "em". Setting to default value...`;
const warnParseCliArgsOpacitiesUnit = `${colors.FgYellow}Received unrecognized "opacitiesUnit" argument, it must be "float" (default) or "percent". Setting to default value...`;
const warnParseCliArgsLetterSpacingUnit = `${colors.FgYellow}Received unrecognized "letterSpacingUnit" argument, it must be "em" (default), "px". Setting to default value...`;
const warnParseCliArgsOutputFormat = `${colors.FgYellow}Received unrecognized "outputFormat" argument, it must be "mjs" (default) or "js". Setting to default value...`;
const warnParseCliArgsSpacingUnit = `${colors.FgYellow}Received unrecognized "spacingUnit" argument, it must be "rem" (default) or "em". Setting to default value...`;

const defaultConfig = {
  debugMode: false,
  fontUnit: 'rem',
  letterSpacingUnit: 'em',
  opacitiesUnit: 'float',
  outputTokenFormat: 'js',
  outputDescriptionFormat: 'js',
  outputFileName: 'figma.json',
  outputFolderBaseFile: '.figmagic',
  outputFolderTokens: 'tokens',
  outputFolderDescriptions: 'descriptions',
  outputFolderElements: 'elements',
  outputFolderGraphics: 'graphics',
  outputFormatGraphics: 'svg',
  outputTokenDataType: null,
  outputScaleGraphics: 1,
  recompileLocal: false,
  remSize: 16,
  skipFileGeneration: {
    react: false,
    styled: false,
    css: false,
    storybook: false,
    description: false,
    forceUpdate: true
  },
  spacingUnit: 'rem',
  syncElements: false,
  syncGraphics: false,
  syncDescriptions: false,
  descriptionTags: ['description'],
  templates: {
    templatePathReact: 'templates/react.jsx',
    templatePathStyled: 'templates/styled.jsx',
    templatePathStorybook: 'templates/story.js'
  },
  usePostscriptFontNames: false,
  removeOld: false,
  graphicConfig: {
    types: ['COMPONENT'],
    frameNames: []
  }
};

/**
 * Parse CLI arguments and return config object
 *
 * @exports
 * @function
 * @param {array} argsArray - Array of string arguments
 * @returns {object} - Returns config object
 * @throws {errorParseCliArgs} - Throws error if no arguments array is provided
 */
function parseCliArgs(argsArray) {
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
          case '--outputFormatGraphics': {
            accumulatedConfig.outputFormatGraphics = argsArray[index + 1];
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

const msgConfigDebugCli = `USER: Command-Line configuration (Medium priority)`;
const msgConfigDebugEnv = `USER: Environment configuration (Low priority)`;
const msgConfigDebugFinal = `SYSTEM: Final user configuration that will be used...`;
const msgConfigDebugRc = `USER: .figmagicrc configuration (Highest priority)`;
const msgDownloadFileWritingFile = (path) => `${colors.FgYellow}\n* Writing file: ${path}`;
const msgGeneratedFileWarning = `THIS FILE IS AUTO-GENERATED BY FIGMAGIC. DO NOT MAKE EDITS IN THIS FILE! CHANGES WILL GET OVER-WRITTEN BY ANY FURTHER PROCESSING.`;
const msgJobComplete = `${colors.FgGreen}\nFigmagic completed operations successfully!`;
const msgSetDataFromApi = `${colors.FgYellow}\nAttempting to fetch data from Figma API...\n`;
const msgSetDataFromLocal = `${colors.FgYellow}\nAttempting to recompile data from local Figma JSON file...\n`;
const msgSyncElements = `${colors.FgYellow}\nAttempting to parse elements...\n`;
const msgSyncGraphics = `${colors.FgYellow}\nGetting images from Figma API...\n`;
const msgWriteBaseFile = `${colors.FgYellow}\nWriting Figma base file...\n`;
const msgWriteTokens = `${colors.FgYellow}\nWriting design tokens...\n`;

//import fs from 'fs';

/**
 * Create configuration object
 *
 * Prioritization:
 * 1. User-provided configuration through `.figmagicrc`
 * 2. Command-line arguments and flags
 * 3. Environment variables from `.env`
 * Non-provided values should fall back to defaults outlined in `meta/config.mjs`
 *
 * @exports
 * @async
 * @function
 * @param {string} userConfigPath - Path to user configuration file, based out of user's current working directory
 * @param {array} cliArgs - Array of any user-provided command line arguments and flags
 * @returns {object} - The final, validated and collated configuration object
 * @throws {errorCreateConfiguration} - Throws error when missing configuration
 */
async function createConfiguration(userConfigPath, ...cliArgs) {
  if (!userConfigPath) throw new Error(errorCreateConfiguration);

  // Set default values first
  // eslint-disable-next-line no-unused-vars
  const { outputFolderComponents, ...DEFAULT_CONFIG } = defaultConfig;

  // RC file configuration
  let RC_CONFIG = {};

  try {
    RC_CONFIG = await loadFile(userConfigPath);
  } catch (e) {} // eslint-disable-line no-empty

  // Env var configuration
  const ENV_CONFIG = {
    token: process.env.FIGMA_TOKEN || null,
    url: process.env.FIGMA_URL || null
  };

  // CLI arguments configuration
  const CLI_CONFIG = parseCliArgs(cliArgs);

  // Merge configurations in order of prioritization
  // 1. Base required config
  // 2. Config file: lowest priority
  // Versioned, "main" local config
  // NOTE: config is not deep-merged
  // 3. Environment config: medium priority
  // Specifically for credentials
  // 4. CLI arguments: highest priority
  // Allow to override on specific commands such as: "figmagic --debug --syncGraphics"
  const CONFIG = {
    ...DEFAULT_CONFIG,
    ...RC_CONFIG,
    ...ENV_CONFIG,
    ...CLI_CONFIG,
    templates: {
      ...DEFAULT_CONFIG.templates,
      ...RC_CONFIG.templates,
      ...CLI_CONFIG.templates
    },
    skipFileGeneration: {
      ...DEFAULT_CONFIG.skipFileGeneration,
      ...RC_CONFIG.skipFileGeneration,
      ...CLI_CONFIG.skipFileGeneration
    }
  };

  if (CONFIG.debugMode === true) {
    console.log(msgConfigDebugEnv);
    console.log(ENV_CONFIG);
    console.log(msgConfigDebugCli);
    console.log(CLI_CONFIG);
    console.log(msgConfigDebugRc);
    console.log(RC_CONFIG);
    console.log(msgConfigDebugFinal);
    console.log(CONFIG);
  }

  return CONFIG;
}

/**
 * Create folder, checking also if it already exists
 *
 * @exports
 * @async
 * @function
 * @param {string} dir - The name of the directory that the user wants to create
 * @returns {Promise} - Returns promise
 * @throws {errorCreateFolder} - When no directory specified
 */
async function createFolder(dir) {
  if (!dir) throw new Error(errorCreateFolder);

  return new Promise((resolve, reject) => {
    try {
      if (!fs__default['default'].existsSync(dir)) {
        fs__default['default'].mkdirSync(dir, { recursive: true }, (error) => {
          if (error) throw error;
          resolve(true);
        });
      }

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get data from API
 *
 * @exports
 * @async
 * @function
 * @param {string} figmaToken - User's Figma API token
 * @param {string} figmaUrl - String representing user's Figma document ID
 * @param {string} [type] - String representing Figma API type ("images" or "files")
 * @returns {object} - The fetched data inside of an object
 * @throws {errorGetFromApi} - Throws error if missing arguments
 */
async function getFromApi(figmaToken, figmaUrl, type = 'files') {
  if (!figmaToken || !figmaUrl) throw new Error(errorGetFromApi);

  return await fetch__default['default'](`https://api.figma.com/v1/${type}/${figmaUrl}`, {
    headers: {
      'X-Figma-Token': figmaToken
    }
  })
    .then((res) => res.json())
    .catch((error) => {
      throw new Error(error);
    });
}

/**
 * Camel-case transform a string
 *
 * @exports
 * @function
 * @param {string} str - The string which is to be camelcased
 * @returns {string} - The final string
 * @throws {errorCamelize} - When no string is provided
 */
function camelize(str) {
  if (!str) throw new Error(errorCamelize);

  return (
    str
      // Add a space after uppercase words
      .replace(/[A-Z]+/g, function (word) {
        return ' ' + word;
      })
      // Replace all characters that are not letter or number with a space
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      // Remove leading and trailing spaces
      .trim()
      // Find all words, and capitalize the first letter
      // and lowercase the rest of the word.
      // Except the first word which is fully lowercased.
      .replace(/[a-zA-Z0-9]+/g, function (word, index) {
        if (index === 0) {
          return word.toLowerCase();
        }

        return word[0].toUpperCase() + word.slice(1).toLowerCase();
      })
      // Finally remove all remaining spaces
      .replace(/ /g, '')
  );
}

/**
 * Round color values so they are whole integers
 *
 * @exports
 * @function
 * @param {number} quantity - Incoming quantity value, as float
 * @param {number} scale - Maximum value, as int (?)
 * @returns {number} - The final number
 */
function roundColorValue(quantity = 0.0, scale = 255) {
  if (scale < 0 || scale > 255) throw new Error(errorRoundColorValue);

  const MIN_VALUE = 0.0;
  const MAX_VALUE = 1.0;

  let _quantity = parseFloat(quantity);
  if (parseFloat(_quantity) < MIN_VALUE) _quantity = MIN_VALUE;
  if (parseFloat(_quantity) > MAX_VALUE) _quantity = MAX_VALUE;

  // We will assume this means the alpha channel or something similar
  if (scale <= 1.0) return parseFloat(_quantity.toFixed(2));

  return parseInt((parseFloat(_quantity) * parseInt(scale)).toFixed(0));
}

/**
 * Places all Figma color frames into a clean object
 *
 * @exports
 * @function
 * @param {object} colorFrame - The color frame from Figma
 * @returns {object} - Returns an object with all the colors
 * @throws {errorSetupColorTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupColorTokensNoChildren} - When Figma frame is missing children
 */
function setupColorTokens(colorFrame) {
  if (!colorFrame) throw new Error(errorSetupColorTokensNoFrame);
  if (!colorFrame.children) throw new Error(errorSetupColorTokensNoChildren);

  let colors = {};

  colorFrame.children.forEach((color) => {
    if (!color.fills) throw new Error(errorSetupColorTokensNoFills);
    // we are not supporting gradients at the moment
    if (color.fills[0].type === 'GRADIENT_LINEAR') return;

    // It seems RGBA alpha is actually not coming from "color.a", so the below fixes that
    const ALPHA = color.fills[0].opacity ? color.fills[0].opacity : color.fills[0].color.a;

    const COLOR_STRING = `rgba(${roundColorValue(color.fills[0].color.r, 255)}, ${roundColorValue(
      color.fills[0].color.g,
      255
    )}, ${roundColorValue(color.fills[0].color.b, 255)}, ${roundColorValue(ALPHA, 1)})`;

    const name = camelize(color.name);

    colors[name] = COLOR_STRING;
  });

  return colors;
}

/**
 * Normalize and convert units
 *
 * @exports
 * @function
 * @param {number} value - Value to normalize
 * @param {string} currentUnit - The current unit to of the incoming value
 * @param {string} spacingUnit - The spacing unit
 * @param {number} remSize - The body rem size
 * @returns {string} - Returns new unit
 * @throws {errorNormalizeUnits} - When missing parameters
 */
function normalizeUnits(value, currentUnit, newUnit, remSize) {
  if (!value || !currentUnit || !newUnit) throw new Error(errorNormalizeUnits);

  let rootSize = undefined;
  let unitSize = undefined;

  // Set root size
  if (currentUnit === 'px') {
    rootSize = 1;
  }

  // Set root size; Kind of a hack? Not sure if this is going to break anything. Used because of 'unitless'
  if (currentUnit === 'percent') {
    rootSize = 1;
  }

  // Set new unit
  if (newUnit === 'rem' || newUnit === 'em') {
    if (!remSize) throw new Error(errorNormalizeUnitsNoRemSize);
    unitSize = remSize;
  }

  if (newUnit === 'unitless') {
    unitSize = value / 100;
  }

  // Add px to corner radius
  if (currentUnit === 'cornerRadius' && newUnit === 'adjustedRadius') {
    return `${value}px`;
  }

  if (rootSize === undefined || unitSize === undefined)
    throw new Error(errorNormalizeUnitsUndefined);

  if (newUnit === 'unitless') {
    return unitSize;
  } else {
    const ADJUSTED_VALUE = value * (rootSize / unitSize);
    return `${ADJUSTED_VALUE}${newUnit}`;
  }
}

/**
 * Places all Figma spacings into a clean object
 *
 * @exports
 * @function
 * @param {object} spacingFrame - The spacing frame from Figma
 * @param {string} spacingUnit - The spacing unit
 * @param {number} remSize - The body rem size
 * @returns {object} - Returns an object with all the spacings
 * @throws {errorSetupSpacingTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupSpacingTokensNoChildren} - When no children in Figma frame
 * @throws {errorSetupSpacingTokensNoUnits} - When missing spacingUnit or remSize arguments
 * @throws {errorSetupSpacingTokensMissingProps} - When missing spacing.name or spacing.absoluteBoundingBox in spacing/children
 */
function setupSpacingTokens(spacingFrame, spacingUnit, remSize) {
  if (!spacingFrame) throw new Error(errorSetupSpacingTokensNoFrame);
  if (!spacingFrame.children) throw new Error(errorSetupSpacingTokensNoChildren);
  if (!spacingUnit || !remSize) throw new Error(errorSetupSpacingTokensNoUnits);

  const SPACINGS = spacingFrame.children;
  const SPACING_OBJECT = {};

  SPACINGS.forEach((spacing) => {
    // Never seems to hit...?
    //if (!spacing.name || !spacing.absoluteBoundingBox)
    //  throw new Error(errorSetupSpacingTokensMissingProps);

    const name = camelize(spacing.name);

    const NORMALIZED_UNIT = normalizeUnits(
      spacing.absoluteBoundingBox.width,
      'px',
      spacingUnit,
      remSize
    );
    SPACING_OBJECT[name] = NORMALIZED_UNIT;
  });

  return SPACING_OBJECT;
}

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
function setupFontTokens(fontFrame, fontUnit, remSize) {
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

/**
 * Places all Figma font sizes into a clean object
 *
 * @exports
 * @function
 * @param {object} fontSizeFrame - The font size frame from Figma
 * @param {string} fontUnit - The font unit type
 * @param {number} remSize - The body rem size
 * @returns {object} - Returns an object with all the font sizes
 * @throws {errorSetupFontSizeTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupFontSizeTokensNoChildren} - When Figma frame is missing children
 * @throws {errorSetupFontSizeTokensNoSizing} - When missing fontUnit or remSize
 * @throws {errorSetupFontSizeTokensMissingProps} - When frame child is missing type.name or type.style
 * @throws {errorSetupFontSizeTokensMissingSize} - When frame child is missing type.style.fontSize
 */
function setupFontSizeTokens(fontSizeFrame, fontUnit, remSize) {
  if (!fontSizeFrame) throw new Error(errorSetupFontSizeTokensNoFrame);
  if (!fontSizeFrame.children) throw new Error(errorSetupFontSizeTokensNoChildren);
  if (!fontUnit || !remSize) throw new Error(errorSetupFontSizeTokensNoSizing);

  let fontSizeObject = {};

  fontSizeFrame.children.forEach((type) => {
    if (!type.name || !type.style) throw new Error(errorSetupFontSizeTokensMissingProps);
    if (!type.style.fontSize) throw new Error(errorSetupFontSizeTokensMissingSize);

    const name = camelize(type.name);
    const FONT_SIZE = type.style.fontSize / remSize + fontUnit;

    fontSizeObject[name] = FONT_SIZE;
  });

  return fontSizeObject;
}

/**
 * Places all Figma font weights into a clean object
 *
 * @exports
 * @function
 * @param {object} fontWeightFrame - The font weight frame from Figma
 * @returns {object} - Returns an object with all the font weights
 * @throws {errorSetupFontWeightTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupFontWeightTokensNoChildren} - When Figma frame is missing children
 * @throws {errorSetupFontWeightTokensMissingProps} - When missing required props on frame children
 * @throws {errorSetupFontWeightTokensMissingWeight} - When missing type.style.fontWeight on child
 */
function setupFontWeightTokens(fontWeightFrame) {
  if (!fontWeightFrame) throw new Error(errorSetupFontWeightTokensNoFrame);
  if (!fontWeightFrame.children) throw new Error(errorSetupFontWeightTokensNoChildren);

  let fontWeightObject = {};

  fontWeightFrame.children.forEach((type) => {
    if (!type.name || !type.style) throw new Error(errorSetupFontWeightTokensMissingProps);
    if (!type.style.fontWeight) throw new Error(errorSetupFontWeightTokensMissingWeight);

    const name = camelize(type.name);
    const fontWeight = type.style.fontWeight;

    fontWeightObject[name] = fontWeight;
  });

  return fontWeightObject;
}

/**
 * Places all Figma line heights into a clean object
 *
 * @exports
 * @function
 * @param {object} lineHeightFrame - The line heights frame from Figma
 * @returns {object} - Returns an object with all the line heights
 * @throws {errorSetupLineHeightTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupLineHeightTokensNoChildren} - When missing children in Figma frame
 * @throws {errorSetupLineHeightTokensMissingProps} - When missing required props on frame children
 * @throws {errorSetupLineHeightTokensMissingPercent} - When missing type.style.lineHeightPercentFontSize on children
 */
function setupLineHeightTokens(lineHeightFrame) {
  if (!lineHeightFrame) throw new Error(errorSetupLineHeightTokensNoFrame);
  if (!lineHeightFrame.children) throw new Error(errorSetupLineHeightTokensNoChildren);

  let lineHeightObject = {};

  lineHeightFrame.children.forEach((type) => {
    if (!type.name || !type.style) throw new Error(errorSetupLineHeightTokensMissingProps);
    if (!type.style.lineHeightPercentFontSize)
      throw new Error(errorSetupLineHeightTokensMissingPercent);

    const name = camelize(type.name);
    const LINE_HEIGHT = normalizeUnits(type.style.lineHeightPercentFontSize, 'percent', 'unitless');

    // Do a tiny bit of rounding to avoid ugly numbers
    lineHeightObject[name] = LINE_HEIGHT.toFixed(2);
  });

  return lineHeightObject;
}

/**
 * Remove all non integer values from a string
 *
 * @exports
 * @function
 * @param {string} str - The string which is to be parsed
 * @returns {string} - The final string
 */
function removeNonIntegerValues(str) {
  return str.replace(/\D+/, '');
}

/**
 * Places all Figma shadows into a clean object
 *
 * @exports
 * @function
 * @param {object} shadowFrame - The shadows frame from Figma
 * @returns {object} - Returns an object with all the shadows
 * @throws {errorSetupShadowTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupShadowTokensNoChildren} - When missing children in Figma frame
 * @throws {errorSetupShadowTokensMissingProps} - When missing required props in frame children
 */
function setupShadowTokens(shadowFrame) {
  if (!shadowFrame) throw new Error(errorSetupShadowTokensNoFrame);
  if (!shadowFrame.children) throw new Error(errorSetupShadowTokensNoChildren);

  let shadowObject = {};

  shadowFrame.children.forEach((type) => {
    if (!type.name || !type.effects) throw new Error(errorSetupShadowTokensMissingProps);

    const name = removeNonIntegerValues(camelize(type.name));

    const effects = type.effects.map((effect) => {
      if (effect.type === 'DROP_SHADOW') return effect;
    });

    shadowObject[name] = ``;

    if (effects.length > 0) {
      effects.forEach((e, index) => {
        const X = e.offset.x;
        const Y = e.offset.y;
        const RADIUS = e.radius;
        const R = roundColorValue(e.color.r);
        const G = roundColorValue(e.color.g);
        const B = roundColorValue(e.color.b);
        const A = roundColorValue(e.color.a, 1);

        shadowObject[name] += `${X}px ${Y}px ${RADIUS}px rgba(${R}, ${G}, ${B}, ${A})`;
        if (index !== effects.length - 1) shadowObject[name] += `, `;
      });
    }
  });

  return shadowObject;
}

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
function setupBorderWidthTokens(borderWidthFrame) {
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
function setupRadiusTokens(radiusFrame) {
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

/**
 * Places all Figma Z indices into a clean object
 *
 * @exports
 * @function
 * @param {object} zIndexFrame - The Z index frame from Figma
 * @returns {object} - Returns an object with all the Z indices
 * @throws {errorSetupZindexTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupZindexTokensNoChildren} - When no children in Figma frame
 * @throws {errorSetupZindexTokensMissingProps} - When missing required props in children
 */
function setupZindexTokens(zIndexFrame) {
  if (!zIndexFrame) throw new Error(errorSetupZindexTokensNoFrame);
  if (!zIndexFrame.children) throw new Error(errorSetupZindexTokensNoChildren);

  let zindexObject = {};

  zIndexFrame.children.forEach((type) => {
    if (!type.name || !type.characters) throw new Error(errorSetupZindexTokensMissingProps);

    const name = camelize(type.name);

    zindexObject[name] = parseInt(type.characters);
  });

  return zindexObject;
}

/**
 * Places all Figma letter spacings into a clean object
 *
 * Figma allows to provide (in the Figma document itself) letterSpacing in either "%" or "px".
 * The API internally converts the provided value in a number, which is the calculated value based on the font-size (no unit is provided, but the value corresponds to px)
 * Ex: if the font-size is 32px and the letterSpacing 4%, the exported value from the API will be 32 * 4 / 100 = 1.28.
 * In CSS however, the letter-spacing length allows either "px" or "em" units (or even "rem" even though it hardly make any sense for letter-spacing in practice):
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing
 *
 * @exports
 * @function
 * @param {object} letterSpacingFrame - The letter spacings frame from Figma
 * @returns {object} - Returns an object with all the letter spacings
 * @throws {errorSetupLetterSpacingTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupLetterSpacingTokensNoChildren} - When missing children on Figma frame
 * @throws {errorSetupLetterSpacingTokensMissingProps} - When missing required props on frame children
 */
function setupLetterSpacingTokens(letterSpacingFrame, letterSpacingUnit) {
  if (!letterSpacingFrame) throw new Error(errorSetupLetterSpacingTokensNoFrame);
  if (!letterSpacingFrame.children) throw new Error(errorSetupLetterSpacingTokensNoChildren);

  // Reduce the children array to a tokens object
  const letterSpacingObject = letterSpacingFrame.children.reduce(
    (tokens, type) => {
      if (!type.name || !type.style) throw new Error(errorSetupLetterSpacingTokensMissingProps);

      const name = camelize(type.name);

      // Assuming Figma API always export the node font-size as an integer in our case
      // https://www.figma.com/plugin-docs/api/TextNode/#fontsize
      const fontSize = parseInt(type.style.fontSize, 10);
      const letterSpacingValueInPx =
        typeof type.style.letterSpacing !== 'undefined'
          ? // Round the value to 2 decimals
            Math.round(parseFloat(type.style.letterSpacing) * 1000) / 1000
          : // if no letter-spacing is defined, set it to 0 by default (no letter-spacing)
            0;
      // actual token value to set
      let value = 0;

      switch (letterSpacingUnit) {
        case 'px':
          // value is already calculated, we just need to add the "px" unit
          value = `${letterSpacingValueInPx}px`;
          break;
        case 'em':
        default:
          // em conversion: rebase on the current font-size
          if (!fontSize) {
            throw new Error(errorSetupLetterSpacingTokensMissingProps);
          }
          // Figma already converted the value to a relative px value
          // Dividing the value by the current fontSize will give the %-based em value.
          // Ex: if the letterSpacing value is 1.28 and fontSize is 32, em value should be 1.28 / 32 = 0.04em.
          value = Math.round((1000 * letterSpacingValueInPx) / fontSize) / 1000;
          value = `${value}em`;
          break;
      }

      tokens[name] = value;

      return tokens;
    },
    // Initial shape: just an empty object
    {}
  );

  return letterSpacingObject;
}

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
function setupMediaQueryTokens(mediaQueryFrame) {
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

  return mediaQueryObject;
}

/**
 * Places all Figma opacities scale into a clean object
 *
 * @exports
 * @function
 * @param {object} opacitiesFrame - The opacities frame from Figma
 * @returns {object} - Returns an object with all the opacities
 * @throws {errorSetupRadiusTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupRadiusTokensNoChildren} - When missing children in Figma frame
 * @throws {errorSetupRadiusTokensMissingProps} - When missing required props in frame children
 */
function setupOpacitiesTokens(opacitiesFrame, opacitiesUnit) {
  if (!opacitiesFrame) throw new Error(errorSetupOpacitiesTokensNoFrame);
  if (!opacitiesFrame.children) throw new Error(errorSetupOpacitiesTokensNoChildren);

  // Reduce the children array to a tokens object
  const opacityTokensObject = opacitiesFrame.children.reduce(
    // Reducer function: will add a new key to the current "opacitiesObject" at each iteration
    (tokens, type) => {
      if (!type.name) throw new Error(errorSetupOpacitiesTokensMissingProps);

      // Note: Figma API does not provide an opacity value if its 100%
      // We will assume it defaults to 1 if undefined.
      const name = camelize(type.name);
      let opacity =
        typeof type.opacity !== 'undefined'
          ? // Keep only 2 decimals of the parsed-to-float value
            Math.round(parseFloat(type.opacity) * 100) / 100
          : 1;

      // Unit conversion
      switch (opacitiesUnit) {
        case 'float':
          // job is already done by default
          break;
        case 'percent':
          opacity = `${opacity * 100}%`;
          break;
      }

      // Assuming name is unique (otherwise it would be overwritten)
      tokens[name] = opacity;

      return tokens;
    },
    // Initial shape: just an empty object
    {}
  );

  return opacityTokensObject;
}

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
function setupDurationTokens(durationFrame) {
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

/**
 * Places all Figma delays into a clean object
 *
 * @exports
 * @function
 * @param {object} delayFrame - The delays frame from Figma
 * @returns {object} - Returns an object with all the animation delay timings
 * @throws {errorSetupDelayTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupDelayTokensNoChildren} - When no children in Figma frame
 * @throws {errorSetupDelayTokensMissingProps} - When missing required props in children
 */
function setupDelayTokens(delayFrame) {
  if (!delayFrame) throw new Error(errorSetupDelayTokensNoFrame);
  if (!delayFrame.children) throw new Error(errorSetupDelayTokensNoChildren);

  let delayObject = {};

  delayFrame.children.forEach((type) => {
    if (!type.name || !type.characters) throw new Error(errorSetupDelayTokensMissingProps);

    const name = camelize(type.name);

    delayObject[name] = parseFloat(type.characters);
  });

  return delayObject;
}

/**
 * Places all Figma easings into a clean object
 *
 * @exports
 * @function
 * @param {object} easingFrame - The easings frame from Figma
 * @returns {object} - Returns an object with all the animation easing values
 * @throws {errorSetupEasingTokensNoFrame} - When there is no provided Figma frame
 * @throws {errorSetupEasingTokensNoChildren} - When no children in Figma frame
 * @throws {errorSetupEasingTokensMissingProps} - When missing required props in children
 */
function setupEasingTokens(easingFrame) {
  if (!easingFrame) throw new Error(errorSetupEasingTokensNoFrame);
  if (!easingFrame.children) throw new Error(errorSetupEasingTokensNoChildren);

  let easingObject = {};

  easingFrame.children.forEach((type) => {
    if (!type.name || !type.characters) throw new Error(errorSetupEasingTokensMissingProps);

    const name = camelize(type.name);

    easingObject[name] = type.characters.trim();
  });

  return easingObject;
}

const ignoreElementsKeywords = ['ignore', 'description', 'layout', 'ignore_layout'];

const tokenAliasMapping = [
  {
    name: 'border',
    alias: ['border', 'borders', 'rahmen']
  },
  {
    name: 'borderWidths',
    alias: ['breiten', 'borderwidth', 'borderwidths']
  },
  {
    name: 'colors',
    alias: ['palette', 'farben', 'color', 'colors', 'colour', 'colours']
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
    name: 'typography',
    alias: ['typography', 'typografie']
  },
  {
    name: 'heading',
    alias: ['heading', 'headings']
  },
  {
    name: 'copy',
    alias: ['copy', 'copytext']
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
    name: 'radius',
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
      'motion durations',
      'motion'
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
  },
  {
    name: 'layout',
    alias: ['layout', 'layouts', 'layoutundgrid']
  },
  {
    name: 'breakpoints',
    alias: ['breakpoints', 'breakpoint', 'responsive-design', 'measure']
  }
];

const componentAliasMapping = [
  {
    name: 'button',
    alias: ['button', 'buttons']
  },
  {
    name: 'form',
    alias: ['form', 'forms', 'formular', 'formulare']
  },
  {
    name: 'card',
    alias: ['card', 'cards', 'karte', 'karten']
  },
  {
    name: 'expander',
    alias: ['expander', 'expanders', 'collapsible', 'collapsibles']
  },
  {
    name: 'notification',
    alias: ['notification', 'notifications', 'benachrichtigung', 'benachrichtigungen']
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
function processTokens(sheet, name, config) {
  if (!sheet || !name) throw new Error(errorProcessTokens);

  // Filter out elements that contain ignore keywords in their name
  const filteredSheet = { ...sheet, children: filterSheetChildren(sheet.children) };
  const groups = filteredSheet.children.filter(
    (item) => item.type === 'GROUP' || item.name.includes('group')
  );
  const _NAME = tokenAliasMapping.find((item) => {
    return item.alias.includes(name.toLowerCase());
  }).name;
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

/**
 * Convert list of imports to string literal for CSS file production
 *
 * @exports
 * @function
 * @param {array} importArray - List of imports
 * @returns {string} - Returns template literal string with import statements
 * @throws {errorCreateImportStringFromList} - Throws error if no importArray is provided
 * @throws {errorCreateImportStringFromListZeroLength} - Throws error if zero-length importArray is provided
 */
function createImportStringFromList(importArray) {
  if (!importArray) throw new Error(errorCreateImportStringFromList);
  if (!(importArray.length > 0)) throw new Error(errorCreateImportStringFromListZeroLength);

  let importString = ``;

  importArray.map((i) => {
    importString += `import ${i} from 'tokens/${i}.mjs';\n`;
  });

  return importString;
}

/**
 * Create enum string from object function
 *
 * @exports
 * @function
 * @param {object} obj - The initial object with data
 * @returns {string} - The final string(enum)
 * @throws {errorCreateEnumStringOutOfObject} - Throws error if no importArray is provided
 */

function createEnumStringOutOfObject(obj) {
  if (!obj) throw new Error(errorCreateEnumStringOutOfObject);

  return Object.entries(obj).reduce((acc, [key, value]) => {
    return `${acc}\n  '${key}' = '${value}',`;
  }, '');
}

/**
 * Exposed function that handles writing files to disk
 *
 * @exports
 * @async
 * @function
 * @param {string} file - File contents
 * @param {string} path - File path minus file name
 * @param {string} name - File name
 * @param {string} type - What type of file is going to be written
 * @param {string} [format=mjs] - File format
 * @param {object} [metadata] - Any metadata needed for writing
 * @param {object} [templates] - Object of templates
 * @throws {errorWriteFile} - Throws error if missing file, path, name or type arguments
 */
async function writeFile(file, path, name, type, format = 'js', metadata, templates) {
  if (!file || !path || !name || !type) throw new Error(errorWriteFile);

  const _TYPE = type.toLowerCase();

  if (
    _TYPE !== 'raw' &&
    _TYPE !== 'token' &&
    _TYPE !== 'component' &&
    _TYPE !== 'style' &&
    _TYPE !== 'css' &&
    _TYPE !== 'story' &&
    _TYPE !== 'description'
  )
    throw new Error(errorWriteFileWrongType);

  createFolder(path);

  const { filePath, fileContent } = await prepareWrite(
    _TYPE,
    file,
    path,
    name,
    format,
    metadata,
    templates
  );

  await write(filePath, fileContent);
}

/**
 * Local helper that does most of the actual formatting of the file
 *
 * @async
 * @function
 * @param {string} type - What type of file is going to be written
 * @param {string} file - File contents
 * @param {string} path - File path minus file name
 * @param {string} name - File name
 * @param {string} format - File format
 * @param {object} metadata - Any metadata needed for writing
 * @param {object} templates - Object of templates
 * @returns {Promise} - Returns promise from wrapped fs.writeFile
 * @throws {errorPrepareWrite} - Throws error if valid type but missing template
 */
async function prepareWrite(type, file, path, name, format, metadata, templates) {
  if (type === 'css' || type === 'story' || type === 'component') {
    if (!templates) throw new Error(errorPrepareWrite);
  }

  let fileContent = ``;

  // Clean name from any slashes
  name = name.replace('/', '');

  const ELEMENT = (() => {
    if (metadata) {
      if (metadata.element) {
        return metadata.element;
      } else return 'div';
    } else return 'div';
  })();

  /*
  const MARKUP = (() => {
    if (metadata) {
      if (metadata.html) {
        return metadata.html;
      } else return '';
    } else return '';
  })();
  */

  const TEXT = (() => {
    if (metadata) {
      if (metadata.text) {
        return metadata.text;
      } else return '';
    } else return '';
  })();

  const EXTRA_PROPS = (() => {
    if (metadata) {
      if (metadata.extraProps) {
        return metadata.extraProps;
      } else return '';
    } else return '';
  })();

  const IMPORTS = (() => {
    if (metadata) {
      if (metadata.imports) {
        if (metadata.imports.length > 0) {
          return createImportStringFromList(metadata.imports);
        }
      } else return '';
    } else return '';
  })();

  let filePath = `${path}/${name}`;

  if (type === 'raw') {
    fileContent = `${JSON.stringify(file, null, ' ')}`;
  }
  // Design token
  else if (type === 'token') {
    if (metadata && metadata.dataType === 'enum') {
      fileContent = `// ${msgGeneratedFileWarning}\n\nenum ${name} {${createEnumStringOutOfObject(
        file
      )}\n}\n\nmodule.exports = ${name};`;
    } else {
      fileContent = `// ${msgGeneratedFileWarning}\n\nconst ${name} = ${JSON.stringify(
        file,
        null,
        ' '
      )}\n\nmodule.exports = ${name};`;
    }
    filePath += `.${format}`;
  }
  // Component
  else if (type === 'component') {
    const SUFFIX = 'Styled';
    const PATH = templates.templatePathReact;
    let template = await loadFile(PATH, true);
    template = template.replace(/{{NAME}}/gi, name);
    template = template.replace(/{{NAME_STYLED}}/gi, `${name}${SUFFIX}`);
    template = template.replace(/{{EXTRA_PROPS}}/gi, EXTRA_PROPS);
    template = template.replace(/\s>/gi, '>'); // Remove any ugly spaces before ending ">"
    template = template.replace(/{{TEXT}}/gi, TEXT);
    //template = template.replace(/{{MARKUP}}/gi, MARKUP);
    fileContent = `${template}`;
    filePath += `.${format}`;
  }
  // Styled Components
  else if (type === 'style') {
    const SUFFIX = 'Styled';
    const PATH = templates.templatePathStyled;
    let template = await loadFile(PATH, true);
    template = template.replace(/{{ELEMENT}}/gi, ELEMENT);
    template = template.replace(/{{NAME_CSS}}/gi, `${name}Css`);
    template = template.replace(/{{NAME_STYLED}}/gi, `${name}${SUFFIX}`);
    fileContent = `${template}`;
    filePath += `${SUFFIX}.${format}`;
  }
  // CSS
  else if (type === 'css') {
    const SUFFIX = 'Css';
    fileContent = `// ${msgGeneratedFileWarning}\n\n${IMPORTS}\nconst ${name}${SUFFIX} = \`${file}\`;\n\nexport default ${name}${SUFFIX};`;
    filePath += `${SUFFIX}.${format}`;
  }
  // Storybook
  else if (type === 'story') {
    const SUFFIX = '.stories';
    const PATH = templates.templatePathStorybook;
    let template = await loadFile(PATH, true);
    template = template.replace(/{{NAME}}/gi, name);
    template = template.replace(/{{TEXT}}/gi, TEXT);
    //template = template.replace(/{{MARKUP}}/gi, MARKUP);
    fileContent = `${template};`;
    filePath += `${SUFFIX}.${format}`;
  }
  // description
  else if (type === 'description') {
    fileContent = `// ${msgGeneratedFileWarning}\n\nconst ${name} = ${JSON.stringify(
      file,
      null,
      ' '
    )}\n\nmodule.exports = ${name};`;
    filePath += `.description.${format}`;
  }

  return { fileContent, filePath };
}

/**
 * Local helper that does the actual writing of the file
 *
 * @async
 * @function
 * @param {string} filePath - File path minus file name
 * @param {string} fileContent- File contents
 * @returns {Promise} - Returns promise from wrapped fs.writeFile
 */
async function write(filePath, fileContent) {
  return await fs__default['default'].writeFile(filePath, fileContent, (err) => {
    if (err) {
      throw err;
    }
  });
  // return await new Promise((resolve, reject) => {
  //   try {
  //     fs.writeFileSync(filePath, fileContent, { flag: 'a' });
  //     resolve(true);
  //   } catch (error) {
  //     reject(error);
  //   }
  // });
}

const acceptedTranslatedTokenTypes = [
  'abstaende',
  'breiten',
  'measure',
  'palette',
  'schatten',
  'transition',
  'transitions'
];

const acceptedTokenTypes = [
  'animation delay',
  'animation delays',
  'animation duration',
  'animation durations',
  'animation easing',
  'borderwidth',
  'borderwidths',
  'breakpoint',
  'breakpoints',
  'color',
  'colors',
  'colour',
  'colours',
  'copy',
  'delay',
  'delays',
  'duration',
  'durations',
  'easing',
  'fontfamilies',
  'fontfamily',
  'fontsize',
  'fontsizes',
  'fontweight',
  'fontweights',
  'heading',
  'letterspacing',
  'letterspacings',
  'lineheight',
  'lineheights',
  'mediaqueries',
  'mediaquery',
  'motion delay',
  'motion delays',
  'motion duration',
  'motion durations',
  'motion easing',
  'opacities',
  'opacity',
  'radii',
  'radius',
  'shadow',
  'shadows',
  'space',
  'spaces',
  'spacing',
  'spacings',
  'zindex',
  'zindices',

  ...acceptedTranslatedTokenTypes
];

/**
 * Write tokens to file
 *
 * @exports
 * @async
 * @function
 * @param {array} tokens - The final array of design tokens
 * @param {object} config - User configuration object
 * @returns {boolean} - Returns true when finished
 * @throws {errorWriteTokens} - Throws error when no tokens are provided
 * @throws {errorWriteTokens} - Throws error when tokens are zero-length
 * @throws {errorWriteTokensNoSettings} - Throws error when missing config
 */
async function writeTokens(tokens, config) {
  if (!tokens) throw new Error(errorWriteTokens);
  if (!(tokens.length > 0)) throw new Error(errorWriteTokens);
  if (!config) throw new Error(errorWriteTokensNoSettings);

  return Promise.all(
    tokens.map(async (token) => {
      let tokenName = camelize(token.name);
      if (acceptedTokenTypes.includes(tokenName.toLowerCase())) {
        const PROCESSED_TOKEN = processTokens(token, tokenName, config);
        tokenName = Object.keys(PROCESSED_TOKEN)[0];
        if (config.debugMode) {
          console.log(PROCESSED_TOKEN);
        }
        await writeFile(
          PROCESSED_TOKEN,
          config.outputFolderTokens,
          tokenName,
          'token',
          config.outputTokenFormat,
          { dataType: config.outputTokenDataType }
        );
      }
    })
  );
}

/**
 * Get data from API
 *
 * @exports
 * @async
 * @function
 * @param {string} url - URL path
 * @param {string} folder - Folder path
 * @param {string} file - File path
 * @returns {Promise} - The fetched data
 * @throws {errorDownloadFile} - Throws error if any required arguments are missing
 */
async function downloadFile(url, folder, file) {
  if (!url || !folder || !file) throw new Error(errorDownloadFile);
  const response = await fetch__default['default'](url);
  if (response.status !== 200) return;

  if (!fs__default['default'].existsSync(folder)) fs__default['default'].mkdirSync(folder);

  return new Promise(async (resolve, reject) => {
    const PATH = `${folder}/${file}`;

    try {
      await fs__default['default'].promises.mkdir(path__default['default'].dirname(PATH));
    } catch (e) {}

    console.log(msgDownloadFileWritingFile(PATH));
    const _file = fs__default['default'].createWriteStream(PATH);
    response.body.pipe(_file);
    _file.on('error', () => reject('Error when downloading file!'));
    _file.on('finish', () => resolve(PATH));
  });
}

/**
 * Write image assets from Figma page to disk
 *
 * @exports
 * @async
 * @function
 * @param {array} fileList - List of objects with file information
 * @param {object} config - Configuration object
 * @returns {boolean} - Return true if finished
 * @throws {errorWriteGraphics} - Throws error if missing fileList or config
 */
async function writeGraphics(fileList, config) {
  if (!fileList || !config) throw new Error(errorWriteGraphics);

  const { outputFolderGraphics, graphicConfig } = config;
  await Promise.all(
    fileList.map(async (file) => {
      const fileName = [
        graphicConfig.useParentAsFolder ? file.parentName : file.group,
        file.file
      ].join('/');
      await downloadFile(file.url, outputFolderGraphics, fileName);
    })
  );

  return true;
}

const mergedAlias = [...tokenAliasMapping, ...componentAliasMapping];

const getTransformedName = (originalName) => {
  const tN = mergedAlias.find((item) => {
    return item.alias.includes(camelize(originalName).toLowerCase());
  });
  return tN ? tN.name : originalName.replace('group-', '');
};

/**
 * Process descriptions
 *
 * @exports
 * @function
 * @param {object} sheet - Sheet object from Figma
 * @param {string} name - Sheet name
 * @param {object} [config] - User configuration object
 * @returns {object} - returns object with design tokens
 * @throws {errorProcessDescriptions} - When missing sheet or name
 * @throws {errorProcessDescriptionsNoConfig} - When missing config, required for certain processing
 */
function processDescriptions(sheet, config) {
  if (!sheet) throw new Error(errorProcessDescriptions);
  if (!config) throw new Error(errorProcessDescriptionsNoConfig);

  const descriptionTags = config.descriptionTags;
  const transformedName = getTransformedName(sheet.name);
  const descriptions = filterDescriptions(sheet.children, transformedName, descriptionTags);
  return descriptions;
}

const filterDescriptions = (sheet, name, descriptionTags, descriptions = []) => {
  if (!sheet || sheet.length === 0) {
    return;
  }

  sheet.forEach((s) => {
    const transformedName = getTransformedName(s.name);
    if (
      descriptionTags.indexOf(transformedName.toLowerCase()) !== -1 ||
      transformedName.indexOf('description-') !== -1
    ) {
      const text =
        (s.children && s.children.find((c) => c.name === 'text' || c.name === 'content')) || s;

      if (!text || !text.characters) {
        return;
      }

      const markdownText = marked__default['default'](text.characters).replace(/\n/g, '');
      descriptions.push({
        text: sanitizeHtml__default['default'](markdownText, {
          disallowedTagsMode: 'escape'
        }),
        parentName: name.replace('group-', ''),
        name: camelize(transformedName)
      });
    }
    if (s.name.indexOf('ignore') === -1) {
      filterDescriptions(s.children, transformedName, descriptionTags, descriptions);
    }
  });
  return descriptions;
};

/**
 * Write description to file
 *
 * @exports
 * @async
 * @function
 * @param {object} descriptionPages - Array of pages including descriptions
 * @param {object} config - User configuration object
 * @returns {boolean} - Returns true when finished
 * @throws {errorWriteDescription} - Throws error when no description are provided or length is 0
 * @throws {errorWriteDescriptionNoSettings} - Throws error when missing config
 */
async function writeDescriptions(descriptionPages, config) {
  if (!descriptionPages) throw new Error(errorWriteDescription);
  if (!descriptionPages.length) throw new Error(errorWriteDescription);
  if (!config) throw new Error(errorWriteDescriptionNoSettings);

  return Promise.all(
    descriptionPages.map(async (d) => {
      const PROCESSED_DESCRIPTIONS = processDescriptions(d, config);
      if (PROCESSED_DESCRIPTIONS.length > 0) {
        const translatedName = getTransformedName(d.name);
        const name = camelize(translatedName);
        const grouped = PROCESSED_DESCRIPTIONS.reduce((res, curr) => {
          if (!res[name]) {
            res[name] = {};
            res[name]['children'] = [];
          }
          if (curr.name === name) {
            res[name] = { ...curr, children: res[name].children };
          } else {
            res[name].children.push(curr);
          }
          return res;
        }, {});

        return await writeFile(
          grouped,
          config.outputFolderDescriptions,
          name,
          'description',
          config.outputDescriptionFormat,
          { dataType: config.outputTokenDataType }
        );
      }
    })
  );
}

function createPages(figmaPages, matchingPageNames = []) {
  if (!figmaPages || !(figmaPages.length > 0)) throw new Error(errorCreatePage);

  const correctPages = [];
  figmaPages.forEach((page) => {
    if (matchingPageNames.includes(page.name.trim())) {
      correctPages.push(page);
    }
  });

  return correctPages;
}

/**
 * Download all image assets from Figma page
 *
 * @exports
 * @async
 * @function
 * @param {object} graphicsPage - Children of the Figma 'Graphics' page
 * @param {object} graphicConfig
 * @param {object} config - Configuration object
 * @returns {array} - Returns file list
 * @throws {errorProcessGraphics} - Throws error if missing missingPage
 */
async function processGraphics(graphicsPage, parentName, config) {
  if (!graphicsPage) throw new Error(errorProcessGraphics);

  const { token, url, outputFormatGraphics, outputScaleGraphics, graphicConfig } = config;
  const IDS = getIds(graphicsPage, parentName, graphicConfig);

  if (IDS.length) {
    const ID_STRING = IDS.map((i) => i.id).join();
    const SETTINGS = `&scale=${outputScaleGraphics}&format=${outputFormatGraphics}`;
    const URL = `${url}?ids=${ID_STRING}${SETTINGS}`;

    const IMAGE_RESPONSE = await getFromApi(token, URL, 'images');
    if (IMAGE_RESPONSE.err) throw new Error(errorProcessGraphicsImageError);
    if (!IMAGE_RESPONSE.images) throw new Error(errorProcessGraphicsNoImages);

    return getFileList(IMAGE_RESPONSE, IDS, outputFormatGraphics);
  }
}

/**
 * Get cleaned list of files
 *
 * @export
 * @function
 * @param {object} imageResponse - Figma API response
 * @param {array} ids - Array of asset IDs
 * @param {string} outputFormatGraphics - String representing expected output format
 * @returns {array} - Array of files with properties
 * @throws {errorGetFileList} - Throws error if missing required arguments
 */
const getFileList = (imageResponse, ids, outputFormatGraphics) => {
  if (!imageResponse || !ids || !outputFormatGraphics) throw new Error(errorGetFileList);

  const fileList = [];
  Object.entries(imageResponse.images).forEach(async ([figmaId, url]) => {
    const entity = ids.find(({ id }) => id === figmaId);
    const name = camelize(entity.name);
    const FILE = `${name}.${outputFormatGraphics}`;

    fileList.push({ url, file: FILE, group: entity.group, parentName: entity.parentName });
  });
  return fileList;
};

const getGraphicNodes = (frame, graphicConfig, graphicNodes = []) => {
  if (
    graphicConfig.frameNames.length !== 0 &&
    graphicConfig.frameNames.indexOf(frame.name) === -1
  ) {
    return [];
  }

  frame.children.forEach((f) => {
    if (graphicConfig.types.indexOf(f.type) !== -1) {
      graphicNodes.push(f);
    } else if (f.type === 'GROUP') {
      getGraphicNodes(f, graphicConfig, graphicNodes);
    }
  });
  return graphicNodes;
};

const getFrameIds = (frame, parentName, graphicConfig) => {
  const graphicNodes = getGraphicNodes(frame, graphicConfig);
  return graphicNodes.map((item) => ({
    id: item.id,
    name: item.name,
    group: frame.name,
    parentName
  }));
};

/**
 * Get IDs from graphics page
 *
 * @export
 * @function
 * @param {object} graphicsPage - Figma 'Graphics' page
 * @param {object} graphicConfig
 * @returns {array} - Array of graphics items
 * @throws {errorGetIds} - Throws error if no graphics page is provided
 * @throws {errorGetIds} - Throws error if graphics page is zero-length
 */
const getIds = (graphicsPage, parentName, graphicConfig) => {
  if (!graphicsPage) throw new Error(errorGetIds);
  if (graphicsPage.length === 0) throw new Error(errorGetIds);

  let items = [];

  graphicsPage
    .filter((item) => item.type === 'FRAME')
    .forEach((frame) => {
      items = [...items, ...getFrameIds(frame, parentName, graphicConfig)];
    });
  return items;
};

const FIGMAGIC_RC_FILENAME = `.figmagicrc`;

async function figmagic({ CLI_ARGS, CWD } = { CLI_ARGS: [], CWD: '' }) {
  // Setup
  const USER_CONFIG_PATH = path__default['default'].join(`${CWD}`, FIGMAGIC_RC_FILENAME);
  const CONFIG = await createConfiguration(USER_CONFIG_PATH, ...CLI_ARGS);
  const {
    token,
    url,
    recompileLocal,
    syncGraphics,
    syncElements,
    syncDescriptions,
    outputFolderBaseFile,
    outputFolderTokens,
    outputFolderDescriptions,
    outputFolderGraphics,
    outputFolderElements,
    tokenPages,
    graphicPages,
    elementPages,
    descriptionPages,
    outputFileName,
    removeOld
  } = CONFIG;

  const DATA = await (async () => {
    // Normal: We want to get data from the Figma API
    if (!recompileLocal) {
      console.log(msgSetDataFromApi);

      // Attempt to get data
      try {
        const _DATA = await getFromApi(token, url);
        // If there's no data or something went funky, eject
        if (!_DATA || _DATA.status === 403) throw new Error(errorGetData);

        return _DATA;
      } catch (error) {
        throw new Error(error);
      }
    }
    // Recompile: We want to use the existing Figma JSON file
    else {
      console.log(msgSetDataFromLocal);

      try {
        return await loadFile(
          path__default['default'].join(`${outputFolderBaseFile}`, `${outputFileName}`)
        );
      } catch (error) {
        throw new Error(error);
      }
    }
  })().catch((error) => {
    throw new Error(error);
  });

  // Write base Figma JSON if we are pulling from the web
  if (!recompileLocal) {
    console.log(msgWriteBaseFile);
    if (removeOld) {
      await trash__default['default']([`./${outputFolderBaseFile}`]);
    }
    await createFolder(outputFolderBaseFile);
    await writeFile(JSON.stringify(DATA), outputFolderBaseFile, outputFileName, 'raw');
  }

  // Process tokens
  const pagesTemp = DATA.document.children;
  const TOKENS_PAGES = createPages(pagesTemp, tokenPages);
  if (TOKENS_PAGES.length > 0) {
    console.log(msgWriteTokens);
    if (removeOld) {
      await trash__default['default']([`./${outputFolderTokens}`]);
    }
    await createFolder(outputFolderTokens);
    await Promise.all(TOKENS_PAGES.map(async (page) => await writeTokens(page.children, CONFIG)));
  }

  if (syncDescriptions) {
    const DESCRIPTION_PAGES = createPages(DATA.document.children, descriptionPages);
    if (DESCRIPTION_PAGES.length > 0) {
      if (removeOld) {
        await trash__default['default']([`./${outputFolderDescriptions}`]);
      }
      await createFolder(outputFolderDescriptions);
      await writeDescriptions(DESCRIPTION_PAGES, CONFIG);
    }
  }

  const COMPONENTS = DATA.components;
  // const STYLES = DATA.styles;
  // Syncing elements
  if (syncElements) {
    const ELEMENTS_PAGES = createPages(DATA.document.children, elementPages);
    if (ELEMENTS_PAGES.length > 0) {
      console.log(msgSyncElements);
      // await createFolder(outputFolderElements);
      // await writeElements(ELEMENTS_PAGES, CONFIG);
      // await Promise.all(
      //   ELEMENTS_PAGES.map(async (page) => {
      //     const elements = await processElements(page.children, COMPONENTS, CONFIG);
      //     return await writeElements(elements, CONFIG);
      //   })
      // );
    }
  }

  // Syncing graphics
  if (syncGraphics) {
    const GRAPHICS_PAGES = createPages(DATA.document.children, graphicPages);

    if (GRAPHICS_PAGES.length > 0) {
      console.log(msgSyncGraphics);
      if (removeOld) {
        await trash__default['default']([`./${outputFolderGraphics}`]);
      }
      await createFolder(outputFolderGraphics);
      await Promise.all(
        GRAPHICS_PAGES.map(async (page) => {
          const FILE_LIST = await processGraphics(page.children, page.name, CONFIG);
          if (FILE_LIST) {
            return await writeGraphics(FILE_LIST, CONFIG);
          }
        })
      );
    }
  }

  // All went well
  console.log(msgJobComplete);
}

module.exports = figmagic;
//# sourceMappingURL=bundle.js.map
