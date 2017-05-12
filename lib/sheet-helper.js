'use strict';

const debug = require('debug')('SheetHelper');
const GoogleSpreadsheet = require('google-sheets-node-api');
const config = require('../config.json');
const StorageHandler = require('./storage-handler');
const storageHandler = new StorageHandler();

const SHEET_ID = config.sheet_id;
const MAPPING_FIELD = config.mapping_field;
const QUESTION_FIELD = config.question_field;

class SheetHelper {
  static getAllResponses() {
    return new Promise((resolve, reject) => {
      const sheet = new GoogleSpreadsheet(SHEET_ID);

      sheet.getRows(1)
        .then((data) => {
          const entries = [].concat(data[0].entry);
          debug(`Got ${entries.length} entries from Google sheet`);
          const rows = entries.map((entry) => {
            let mapping = sanitizeMappingField(entry['gsx:' + MAPPING_FIELD]);
            debug(`Mapping through ${MAPPING_FIELD}`);

            return {
              timestamp: new Date(entry['gsx:timestamp']),
              mapping,
              response: entry['gsx:' + QUESTION_FIELD]
            };
          });

          resolve(rows);
        });
    });
  }
}

function sanitizeMappingField(value) {
  value = value.replace(' ', '');

  if (!value.endsWith('/')) {
    value += '/';
  }

  if (value.includes('http://')) {
    value = value.replace('http://', 'https://');
  }

  if (!value.startsWith('https://reps.mozilla.org/u/')) {
    value = 'https://reps.mozilla.org/u/' + value;
  }

  value = value.toLowerCase();

  return value;
}

module.exports = SheetHelper;
