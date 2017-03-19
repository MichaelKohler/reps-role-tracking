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
}

module.exports = Reps;
