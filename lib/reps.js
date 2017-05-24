'use strict';

const _ = require('lodash');
const debug = require('debug')('Reps');
const config = require('../config.json');
const SheetHelper = require('./sheet-helper');
const StorageHandler = require('./storage-handler');
const storageHandler = new StorageHandler();

class Reps {
  static getAll() {
    return this.getAllWithResponses();
  }

  static getAllWithoutResponses() {
    debug('Getting all Reps without Responses');
    return storageHandler.getStorageItem('reps');
  }

  static getAllWithResponses() {
    debug('Getting all Reps with Responses');
    let allRepsWithResponses = [];
    const allReps = storageHandler.getStorageItem('reps');

    return SheetHelper.getAllResponses()
      .then((responses) => {
        debug('Mapping responses to Reps');
        allRepsWithResponses = allReps.map((rep) => {
          const repsProfileUrl = rep.profile.remo_url.toLowerCase();
          rep.response = _.find(responses, { mapping: repsProfileUrl }) || {};
          return rep;
        });

        return allRepsWithResponses;
      })
      .then((allRepsWithResponses) => {
        const withoutResponses = allRepsWithResponses.filter((rep) => {
          return !rep.response.response;
        });
        console.log('without...', withoutResponses.length);
        return allRepsWithResponses;
      });
  }

  static getWithMentorInfo() {
    debug('Getting all Reps with Mentor info');
    return this.getAll()
      .then((reps) => {
        reps.forEach((rep) => {
          rep.isMentor = false;

          rep.profile.groups.forEach((group) => {
            if (group.name === 'Mentor') rep.isMentor = true;
          });
        });

        return reps;
      });
  }

  static getGroupedByMentor() {
    debug('Getting all Reps grouped by mentor');
    return this.getAll()
      .then((reps) => {
        const repsSortedByMentor = _.groupBy(reps, (rep) => {
          if (!rep.profile.mentor) {
            return '';
          }

          return rep.profile.mentor.first_name + ' ' + rep.profile.mentor.last_name;
        });

        const keys = Object.keys(repsSortedByMentor);
        keys.forEach((mentorName) => {
          repsSortedByMentor[mentorName] = {
            mentor: this.findByName(mentorName),
            mentees: repsSortedByMentor[mentorName]
          }
        });

        return _.sortBy(repsSortedByMentor, 'mentor.first_name');
      });
  }

  static findByName(name) {
    debug('Getting a Rep by name');
    const allReps = this.getAllWithoutResponses();
    const rep = _.find(allReps, (rep) => {
      const fullName = rep.first_name + ' ' + rep.last_name;
      if (fullName === name) {
        return rep;
      }
    });

    if (!rep) {
      debug('WARNING: Could not find Rep by name!!', name);
    }

    return rep;
  }

  static getGroupedByCountry() {
    debug('Getting all Reps grouped by country');
    return this.getAll()
      .then((reps) => {
        const statsSortedByCountry = [];
        reps.forEach((rep) => {
          const country = _.find(statsSortedByCountry, { name: rep.profile.country });

          if (!country) {
            statsSortedByCountry.push({
              name: rep.profile.country,
              today: 1,
              responded: rep.response.response ? 1 : 0,
              mobilizers: rep.response.response === config.mobilizers_answer ? 1 : 0,
              functional: rep.response.response === config.functional_answer ? 1 : 0
            });
          } else {
            country.today++;
            country.responded = rep.response.response ? country.responded + 1 : country.responded;
            country.mobilizers = rep.response.response === config.mobilizers_answer ? country.mobilizers + 1 : country.mobilizers;
            country.functional = rep.response.response === config.functional_answer ? country.functional + 1 : country.functional;
          }
        });

        return _.sortBy(statsSortedByCountry, 'name');
      });
  }

  static getTotals() {
    debug('Starting to calculate totals..');
    const totals = {
      reps: this.getAllWithoutResponses().length
    };

    let allResponses = [];

    return SheetHelper.getAllResponses()
      .then((responses) => {
        allResponses = responses;

        totals.responses = responses.length;
        totals.ratio = (totals.responses / totals.reps * 100).toFixed(2);
        totals.mobilizers = _.filter(responses, { response: config.mobilizers_answer }).length;
        totals.functional = _.filter(responses, { response: config.functional_answer }).length;
        totals.choiceRatio = (totals.mobilizers / totals.responses * 100).toFixed(2);
      })
      .then(() => {
        return this.getWithMentorInfo();
      })
      .then((allReps) => {
        totals.noMentorResponse = 0;

        allReps.map((rep) => {
          const response = _.find(allResponses, { mapping: rep.profile.remo_url });
          if (rep.isMentor && !response) {
            totals.noMentorResponse++;
          }
        });

        return this.getGroupedByMentor();
      })
      .then((allGroupedByMentor) => {
        totals.repsWithNoMentorResponse = 0;

        allGroupedByMentor.forEach((mentor) => {
          if (!mentor.mentor) {
            totals.repsWithNoMentorResponse += mentor.mentees.length;
            return;
          }

          if (!mentor.mentor.response.response) {
            totals.repsWithNoMentorResponse += mentor.mentees.length;
          }
        });

        return totals;
      });
  }
}

module.exports = Reps;
