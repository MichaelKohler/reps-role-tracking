'use strict';

const debug = require('debug')('ReMo');
const fetch = require('node-fetch');

class RemoHelper {
  constructor() {
    this.url = 'https://reps.mozilla.org/api/remo/v1/users/?format=json';
    this.reps = [];
    this.fetchLength = 20;
  }

  /**
   * Initializes a query for all Reps.
   *
   * @return {Promise}              Promise which resolves with all repositories found
   */
  getAll() {
    return new Promise((resolve, reject) => {
      this.fetchPagesRecursively(this.url, resolve, reject);
    });
  }

  /**
   * Fetches Reps
   *
   * @param  {String}  url           page of the current iteration
   * @param  {Function} resolve      Promise resolve function
   * @param  {Function} reject       Promise reject function
   */
  fetchPagesRecursively(url, resolve, reject) {
    debug(`getting next page ${url}`);

    fetch(url).then((res) => {
      return res.json();
    }).then((response) => {
      const results = response.results;
      if (!response || results.length === 0) {
        return reject(new Error(`we did not get any more Reps from the API`))
      }

      debug(`got ${results.length} Reps`);

      this.reps = this.reps.concat(results);

      if (results && results.length === this.fetchLength) {
        debug(`we need to get more!`);
        this.fetchPagesRecursively(response.next, resolve, reject);
      } else {
        resolve(this.reps);
      }
    }).catch((err) => {
      reject(err);
    });
  }

  /**
   * Fetches a Reps profile
   */
  fetchRepsProfile(url) {
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => {
        debug('Successfully fetched', url);
        return res.json();
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        debug('We had an error fetching a profile', url, err);
      });
    });
  }
}

module.exports = RemoHelper;
