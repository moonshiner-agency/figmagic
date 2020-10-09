import { camelize } from '../helpers/camelize.mjs';
import { processTokens } from '../process/processTokens.mjs';
import { writeFile } from './writeFile.mjs';
import { errorWriteTokens, errorWriteTokensNoSettings } from '../../meta/errors.mjs';
import { acceptedTokenTypes } from '../../meta/acceptedTokenTypes.mjs';

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
export async function writeTokens(tokens, config) {
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
