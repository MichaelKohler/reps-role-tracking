const express = require('express');
const Reps = require('../lib/reps');
const router = express.Router();

router.get('/', (req, res, next) => {
  Reps.getTotals()
    .then((totals) => {
      res.render('index', {
        title: 'Reps Role Focus Tracking - Overview',
        totals
      });
    });
});

router.get('/list', (req, res, next) => {
  Reps.getWithMentorInfo()
    .then((reps) => {
      res.render('list', {
        title: 'Reps Role Focus Tracking - all Reps',
        reps
      });
    });
});

router.get('/mentors', (req, res, next) => {
  Reps.getGroupedByMentor()
    .then((reps) => {
      res.render('mentors', {
        title: 'Reps Role Focus Tracking - by mentor',
        reps
      });
    });
});

module.exports = router;
