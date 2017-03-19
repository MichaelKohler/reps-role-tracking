const express = require('express');
const StorageHandler = require('../lib/storage-handler');
const router = express.Router();
const storageHandler = new StorageHandler();

/* GET home page. */
router.get('/', (req, res, next) => {
  const reps = storageHandler.getStorageItem('reps');

  res.render('index', {
    title: 'Reps Role Focus Tracking',
    reps
  });
});

module.exports = router;
