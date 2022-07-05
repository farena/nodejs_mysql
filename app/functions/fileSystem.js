/* eslint-disable no-async-promise-executor */
const fs = require('fs-extra');
const path = require('path');
const { uuid } = require('uuidv4');
const axios = require('axios');

module.exports = {
  clearTempFolder: async () => {
    try {
      const files = await module.exports.readDir('.temp');

      if (files.length) {
        for (const file of files) {
          module.exports.clearFile(path.join('.temp', file));
        }
      }
      console.log('Temp Folder cleared');
    } catch (error) {
      console.error(error);
    }
  },
  clearFile: (filePath) => new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  }),
  readDir: (dir) => new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  }),
  // return a promise and resolve when download finishes
  saveFileFromUrl: async (url, extension) => new Promise(async (resolve, reject) => {
    const response = await axios.get(url, {
      responseType: 'stream',
    });

    // Save file in temp folder
    const tempPath = path.resolve(__dirname, '../../.temp', `${uuid()}${extension}`);
    response.data.pipe(fs.createWriteStream(tempPath));

    response.data.on('end', async () => {
      resolve(tempPath);
    });

    response.data.on('error', () => {
      reject(new Error('Error downloading PDF'));
    });
  }),
  timeout: async (ms) => new Promise((res) => {
    setTimeout(() => { res(); }, ms);
  }),

};
