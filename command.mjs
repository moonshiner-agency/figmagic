#!/bin/sh
':'; //# ; exec /usr/bin/env node --experimental-modules --no-warnings "$0" "$@"

import dotenv from 'dotenv';
import figmagic from './index';
import { colors } from './bin/meta/colors.mjs';

(async () => {
  try {
    console.log('command');
    dotenv.config();
    const [, , ...CLI_ARGS] = process.argv;
    await figmagic({ CLI_ARGS, CWD: process.cwd() });
  } catch (error) {
    console.error(`${colors.FgRed}${error}`);
  }
})();
