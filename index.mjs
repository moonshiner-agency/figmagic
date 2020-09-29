import path from 'path';
import trash from 'trash';

import { createConfiguration } from './bin/functions/config/createConfiguration.mjs';

import { loadFile } from './bin/functions/filesystem/loadFile.mjs';
import { createFolder } from './bin/functions/filesystem/createFolder.mjs';
import { getFromApi } from './bin/functions/filesystem/getFromApi.mjs';
import { writeTokens } from './bin/functions/filesystem/writeTokens.mjs';
import { writeFile } from './bin/functions/filesystem/writeFile.mjs';
import { writeElements } from './bin/functions/filesystem/writeElements.mjs';
import { writeGraphics } from './bin/functions/filesystem/writeGraphics.mjs';

import { createPages } from './bin/functions/process/createPage.mjs';
import { processGraphics } from './bin/functions/process/processGraphics.mjs';
import { processElements } from './bin/functions/process/processElements.mjs';

import { errorGetData } from './bin/meta/errors.mjs';
import {
  msgSetDataFromLocal,
  msgSetDataFromApi,
  msgWriteBaseFile,
  msgSyncGraphics,
  msgSyncElements,
  msgWriteTokens,
  msgJobComplete
} from './bin/meta/messages.mjs';

const FIGMAGIC_RC_FILENAME = `.figmagicrc`;

export default async function figmagic({ CLI_ARGS, CWD } = { CLI_ARGS: [], CWD: '' }) {
  // Setup
  const USER_CONFIG_PATH = path.join(`${CWD}`, FIGMAGIC_RC_FILENAME);
  const CONFIG = await createConfiguration(USER_CONFIG_PATH, ...CLI_ARGS);
  const {
    token,
    url,
    recompileLocal,
    syncGraphics,
    syncElements,
    outputFolderBaseFile,
    outputFolderTokens,
    outputFolderGraphics,
    outputFolderElements,
    tokenPages,
    graphicPages,
    elementPages,
    outputFileName
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
        return await loadFile(path.join(`${outputFolderBaseFile}`, `${outputFileName}`));
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
    const DATA = await getFromApi(token, url);
    await trash([`./${outputFolderBaseFile}`]);
    await createFolder(outputFolderBaseFile);
    await writeFile(JSON.stringify(DATA), outputFolderBaseFile, outputFileName, 'raw');
  }

  // Process tokens
  console.log(msgWriteTokens);
  const TOKENS_PAGES = createPages(DATA.document.children, tokenPages);
  await trash([`./${outputFolderTokens}`]);
  await createFolder(outputFolderTokens);

  await Promise.all(TOKENS_PAGES.map(async (page) => await writeTokens(page.children, CONFIG)));

  const COMPONENTS = DATA.components;
  //const STYLES = DATA.styles;
  // Syncing elements
  if (syncElements) {
    console.log(msgSyncElements);
    const ELEMENTS_PAGES = createPages(DATA.document.children, elementPages);
    await createFolder(outputFolderElements);
    await Promise.all(
      ELEMENTS_PAGES.map(async (page) => {
        // console.log(page.children);
        const elements = await processElements(page.children, COMPONENTS, CONFIG);
        console.log(elements);

        return await writeElements(elements, CONFIG);
      })
    );
  }

  // Syncing graphics
  if (syncGraphics) {
    console.log(msgSyncGraphics);
    const GRAPHICS_PAGES = createPages(DATA.document.children, graphicPages);

    await trash([`./${outputFolderGraphics}`]);
    await createFolder(outputFolderGraphics);

    await Promise.all(
      GRAPHICS_PAGES.map(async (page) => {
        const FILE_LIST = await processGraphics(page.children, CONFIG);
        return await writeGraphics(FILE_LIST, CONFIG);
      })
    );

    // const FILE_LIST = await processGraphics(GRAPHICS_PAGES.children, CONFIG);
    // await writeGraphics(FILE_LIST, CONFIG);
  }

  // All went well
  console.log(msgJobComplete);
}
