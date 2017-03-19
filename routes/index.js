const express = require('express');
const Reps = require('../lib/reps');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  Reps.getWithMentorInfo()
    .then((reps) => {
      res.render('index', {
        title: 'Reps Role Focus Tracking',
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
