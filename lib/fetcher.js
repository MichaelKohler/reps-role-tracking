'use strict';

const debug = require('debug')('fetch');
const async = require('async');
const RemoHelper = require('./remo-helper');
const StorageHandler = require('./storage-handler');

class Fetcher {
  constructor() {
    this.remoHelper = new RemoHelper();
    this.storageHandler = new StorageHandler();
    this.alreadyFetchedActivities = this.storageHandler.getStorageItem('repsactivities') || [];
    this.fetchedActivityURLs = this.storageHandler.getStorageItem('repsactivities-urls') || [];
  }

  fetchAll() {
    debug('Starting to fetch everything...');
    this.storageHandler.removeStorageItem('reps');

    return this.remoHelper.getAll()
      .then((reps) => {
        debug(`Fetched ${reps.length} Reps from API`);

        return new Promise((resolve, reject) => {
          async.series(reps.map((rep) => {
            return (done) => {
              this.remoHelper.fetchRepsUrl(rep._url)
                .then((profile) => {
                  rep.profile = profile;
                  done();
                });
            };
          }), (err, results) => {
            if (err) {
              reject(err);
            } else {
              console.log(reps);
              resolve(reps);
            }
          }, true);
        });
      })
      .then((advancedInfoReps) => {
        this.storageHandler.saveStorageItem('reps', advancedInfoReps);
      })
      .catch((err) => {
        debug('Error fetching from Reps', err);
      });
  }

  fetchAllActivities(numberOfPages) {
    debug('Starting to fetch everything...');
    this.storageHandler.removeStorageItem('repsactivities');

    return this.remoHelper.getAllActivities(numberOfPages)
      .then((activities) => {
        debug(`Fetched ${activities.length} Activities from API`);

        return new Promise((resolve, reject) => {
          async.series(activities.map((activity) => {
            return (done) => {
              if (!this.fetchedActivityURLs.includes(activity._url)) {
                this.remoHelper.fetchRepsUrl(activity._url)
                  .then((activityDetail) => {
                    activity.activityDetails = activityDetail;
                    // We save the activities after every fetch to make sure we can only
                    // fetch new links in the future.
                    this.alreadyFetchedActivities.push(activity);
                    this.storageHandler.saveStorageItem('repsactivities', this.alreadyFetchedActivities);
                    this.fetchedActivityURLs.push(activity._url);
                    this.storageHandler.saveStorageItem('repsactivities-urls', this.fetchedActivityURLs);
                    done();
                  });
              } else {
                done();
              }
            };
          }), (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(this.alreadyFetchedActivities);
            }
          }, true);
        });
      })
      .then((advancedActivities) => {
        this.storageHandler.saveStorageItem('repsactivities', advancedActivities);
      })
      .catch((err) => {
        debug('Error fetching from Reps', err);
      });
  }
}

module.exports = Fetcher;
