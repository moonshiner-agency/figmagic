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
import { writeDescriptions } from './bin/functions/filesystem/writeDescriptions.mjs';

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
    if (removeOld) {
      await trash([`./${outputFolderBaseFile}`]);
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
      await trash([`./${outputFolderTokens}`]);
    }
    await createFolder(outputFolderTokens);
    await Promise.all(TOKENS_PAGES.map(async (page) => await writeTokens(page.children, CONFIG)));
  }

  if (syncDescriptions) {
    const DESCRIPTION_PAGES = createPages(DATA.document.children, descriptionPages);
    if (DESCRIPTION_PAGES.length > 0) {
      if (removeOld) {
        await trash([`./${outputFolderDescriptions}`]);
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
        await trash([`./${outputFolderGraphics}`]);
      }
      await createFolder(outputFolderGraphics);
      await Promise.all(
        GRAPHICS_PAGES.map(async (page) => {
          const FILE_LIST = await processGraphics(page.children, page.name, CONFIG);
          return await writeGraphics(FILE_LIST, CONFIG);
        })
      );
    }
  }

  // All went well
  console.log(msgJobComplete);
}
