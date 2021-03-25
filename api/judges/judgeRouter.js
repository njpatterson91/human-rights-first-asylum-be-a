const express = require('express');
const Judges = require('./judgeModel');
const verify = require('../middleware/verifyDataID');
const Cache = require('../middleware/cache');
const fs = require('fs');
const JSZip = require('jszip');
const cacache = require('cacache');

// TODO add auth to router - final phase

// router
const router = express.Router();

//middleware

router.use('/:id', verify.verifyJudge);

router.get('/', (req, res) => {
  Judges.findAll()
    .then((judges) => {
      res.status(200).json(judges);
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

router.get('/:id', (req, res) => {
  const id = String(req.params.id);
  const key = String(req.originalUrl);
  Judges.findById(id)
    .then((judges) => {
      Cache.makeCache(key, JSON.stringify(judges));
      res.status(200).json(judges);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

router.get('/:id/csv', Cache.zipCache, (req, res) => {
  const judge_id = String(req.params.judge_id);

  Judges.writeCSV(judge_id)
    .then((csv) => {
      const zip = new JSZip();

      zip.file(`${judge_id}_judge_data.csv`, csv[0]);
      zip.file(`${judge_id}_country_data.csv`, csv[1]);
      zip.file(`${judge_id}_case_data.csv`, csv[2]);
      zip.file(`${judge_id}_social_data.csv`, csv[3]);
      zip.file(`${judge_id}_grounds_data.csv`, csv[4]);

      cacache.tmp
        .withTmp('/tmp/data', (dir) => {
          zip
            .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(`${dir}.zip`))
            .on('finish', function () {
              res.header('Content-Type', 'application/zip');
              res.attachment(`${judge_id}_data.zip`);
              res.status(200).download(`${dir}.zip`);
            });
        })
        .then(() => {
          // `dir` no longer exists
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

module.exports = router;
