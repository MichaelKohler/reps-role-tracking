'use strict';

const _ = require('lodash');
const StorageHandler = require('./storage-handler');
const storageHandler = new StorageHandler();

class Reps {
  static getAll() {
    return storageHandler.getStorageItem('reps');
  }

  static getWithMentorInfo() {
    const reps = this.getAll();

    reps.forEach((rep) => {
      rep.isMentor = false;

      rep.profile.groups.forEach((group) => {
        if (group.name === 'Mentor') rep.isMentor = true;
      });
    });

    return reps;
  }

  static getGroupedByMentor() {
    const reps = this.getAll();

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
  }

  static findByName(name) {
    const allReps = this.getAll();
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
