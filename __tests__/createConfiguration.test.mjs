import path from 'path';
import { createConfiguration } from '../bin/functions/config/createConfiguration';

test('It should return a valid merged configuration if given a path to an RC file and a set of CLI arguments', async () => {
  const USER_CONFIG_PATH = path.join(process.cwd(), 'testdata', 'figmagicrc');
  const CLI_ARGS = ['-t', 'asdf1234'];

  expect(await createConfiguration(USER_CONFIG_PATH, ...CLI_ARGS)).toEqual(
    expect.objectContaining({
      debugMode: false,
      fontUnit: 'rem',
      outputFileName: 'figma.json',
      outputFolderBaseFile: '.figmagic',
      outputFolderElements: 'elements',
      outputFolderGraphics: 'graphics',
      outputFolderTokens: 'tokens',
      outputFormatGraphics: 'svg',
      outputScaleGraphics: 1,
      outputTokenFormat: 'js',
      outputTokenDataType: null,
      recompileLocal: false,
      remSize: 16,
      skipFileGeneration: {
        css: false,
        description: false,
        forceUpdate: true,
        react: false,
        storybook: false,
        styled: false
      },
      spacingUnit: 'rem',
      syncElements: false,
      syncGraphics: false,
      templates: {
        templatePathReact: 'templates/react.jsx',
        templatePathStorybook: 'templates/story.js',
        templatePathStyled: 'templates/styled.jsx'
      },
      usePostscriptFontNames: false
    })
  );
});

test('It should throw an error when missing user configuration path', async () => {
  await expect(createConfiguration()).rejects.toThrow();
});

test('It logs the configuration when debug mode is enabled', async () => {
  // mock console.log to reduce the noise in the terminal
  const mocks = [jest.spyOn(global.console, 'log').mockImplementation()];

  const configuration = await createConfiguration({}, ...['--debug']);

  expect(global.console.log).toHaveBeenCalledWith(configuration);

  mocks.forEach((spy) => spy.mockRestore());
});
