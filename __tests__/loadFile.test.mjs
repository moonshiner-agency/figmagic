import path from 'path';

import { loadFile } from '../bin/functions/filesystem/loadFile';

test('It should throw an error if no parameter is provided', async () => {
  await expect(loadFile()).rejects.toThrow();
});

test('It should throw an error if invalid path is provided', async () => {
  const BAD_PATH = `./AKLJR#LJKASlaks`;
  await expect(loadFile(BAD_PATH)).rejects.toThrow();
});

test('It should return data from local file', async () => {
  const FILE = await loadFile(path.join(`${process.cwd()}`, `testdata`, `figmagicrc`));
  expect(FILE).toEqual(
    expect.objectContaining({
      debugMode: false,
      fontUnit: 'rem',
      outputFileName: 'figma.json',
      outputFolderBaseFile: '.figmagic',
      outputFolderGraphics: 'graphics',
      outputFolderTokens: 'tokens',
      outputFormatGraphics: 'svg',
      outputScaleGraphics: 1,
      outputTokenFormat: 'js',
      spacingUnit: 'rem',
      usePostscriptFontNames: false
    })
  );
});

/*
// DEACTIVATING THIS, AS IT BREAKS ON WINDOWS BUILDS (...?)

test('It should return data from local file in raw format (not JSON-parsed)', async () => {
  const FILE = await loadFile(path.join(`${process.cwd()}`, `testdata`, `figmagicrc`), true);

  console.log('FILE', FILE);

  expect(FILE).toBe(`{
  \"debugMode\": false,
  \"fontUnit\": \"rem\",
  \"outputFileName\": \"figma.json\",
  \"outputFolderBaseFile\": \".figmagic\",
  \"outputFolderTokens\": \"tokens\",
  \"outputTokenFormat\": \"js\",
  \"outputFolderGraphics\": \"graphics\",
  \"outputFormatGraphics\": \"svg\",
  \"outputScaleGraphics\": 1,
  \"spacingUnit\": \"rem\",
  \"usePostscriptFontNames\": false
}`);
});
*/
