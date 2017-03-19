const express = require('express');
const StorageHandler = require('../lib/storage-handler');
const router = express.Router();
const storageHandler = new StorageHandler();

/* GET home page. */
router.get('/', (req, res, next) => {
  const reps = storageHandler.getStorageItem('reps');
  reps.forEach((rep) => {
    rep.isMentor = false;

    rep.profile.groups.forEach((group) => {
      if (group.name === 'Mentor') rep.isMentor = true;
    });
  });

  res.render('index', {
    title: 'Reps Role Focus Tracking',
    reps
  });
});

module.exports = router;
