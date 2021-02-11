import fetch, { Response } from 'node-fetch';
import fs from 'fs';
import { Readable } from 'stream';
import path from 'path';
import { msgDownloadFileWritingFile } from '../../meta/messages.mjs';
import { errorDownloadFile } from '../../meta/errors.mjs';

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
export async function downloadFile(url, folder, file) {
  if (!url || !folder || !file) throw new Error(errorDownloadFile);
  const response = await fetch(url);
  if (response.status !== 200) return;

  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  return new Promise(async (resolve, reject) => {
    const PATH = `${folder}/${file.replace(/Keepcols/g, '')}`;

    try {
      await fs.promises.mkdir(path.dirname(PATH));
    } catch (e) {}

    console.log(msgDownloadFileWritingFile(PATH));
    const _file = fs.createWriteStream(PATH);
    if (!file.includes('Keepcols') && file.includes('.svg')) {
      const text = await response.text();
      const modifiedText = text.replace(/(#\w+)/gm, 'currentColor');
      const readable = new Readable.from([modifiedText]);
      const newResponse = new Response(readable, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      newResponse.body.pipe(_file);
    } else {
      response.body.pipe(_file);
    }
    _file.on('error', () => reject('Error when downloading file!'));
    _file.on('finish', () => resolve(PATH));
  });
}
