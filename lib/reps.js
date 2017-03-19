'use strict';

const _ = require('lodash');
const SheetHelper = require('./sheet-helper');
const StorageHandler = require('./storage-handler');
const storageHandler = new StorageHandler();

class Reps {
  static getAll() {
    return this.getAllWithResponses();
  }

  static getAllWithoutResponses() {
    return storageHandler.getStorageItem('reps');
  }

  static getAllWithResponses() {
    let allRepsWithResponses = [];
    const allReps = storageHandler.getStorageItem('reps');

    return SheetHelper.getAllResponses()
      .then((responses) => {
        allRepsWithResponses = allReps.map((rep) => {
          rep.response = _.find(responses, { mapping: rep.profile.remo_url }) || {};
          return rep;
        });

        return allRepsWithResponses;
      });
  }

  static getWithMentorInfo() {
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

        return repsSortedByMentor;
      });
  }

  static findByName(name) {
    const allReps = this.getAllWithoutResponses();
    const rep = _.find(allReps, (rep) => {
      const fullName = rep.first_name + ' ' + rep.last_name;
      if (fullName === name) {
        return rep;
      }
    });

    return rep;
  }

  static getTotals() {
    const totals = {
      reps: this.getAllWithoutResponses().length
    };

    let allResponses = [];

    return SheetHelper.getAllResponses()
      .then((responses) => {
        allResponses = responses;

        totals.responses = responses.length;
        totals.ratio = (totals.responses / totals.reps * 100).toFixed(2);
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

        Object.keys(allGroupedByMentor).forEach((mentorName) => {
          const mentor = this.findByName(mentorName);
          if (mentor) {
            const mentorResponse = _.find(allResponses, { mapping: mentor.profile.remo_url });

            if (!mentorResponse) {
              totals.repsWithNoMentorResponse += allGroupedByMentor[mentorName].mentees.length;
            }
          }
        });

        return totals;
      });
  }
}

module.exports = Reps;
