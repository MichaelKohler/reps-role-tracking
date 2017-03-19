const express = require('express');
const Reps = require('../lib/reps');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const reps = Reps.getWithMentorInfo();

  res.render('index', {
    title: 'Reps Role Focus Tracking',
    reps
  });
});

router.get('/mentors', (req, res, next) => {
  const reps = Reps.getGroupedByMentor();

  res.render('mentors', {
    title: 'Reps Role Focus Tracking - by mentor',
    reps
  });
});

module.exports = router;
