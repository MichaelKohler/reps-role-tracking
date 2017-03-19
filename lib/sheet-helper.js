'use strict';

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
          const entries = data[0].entry;
          const rows = entries.map((entry) => {
            return {
              timestamp: new Date(entry['gsx:timestamp']),
              mapping: entry['gsx:' + MAPPING_FIELD],
              response: entry['gsx:' + QUESTION_FIELD]
            };
          });

          resolve(rows);
        });
    });
  }
}

module.exports = SheetHelper;
