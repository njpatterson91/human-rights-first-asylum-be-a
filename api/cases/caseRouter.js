const express = require('express');
const Cases = require('./caseModel');
const AWS = require('../../utils/AWS');
const Verify = require('../middleware/verifyDataID');
const Cache = require('../middleware/cache');
const CSV = require('csv-string');
const router = express.Router();

// TODO add auth to route also - final phase

//middleware

router.use('/:id', Verify.verifyCase);

//routes

router.get('/', Cache.checkCache, (req, res) => {
  const key = String(req.originalUrl);

  Cases.findAll()
    .then((cases) => {
      Cache.makeCache(key, JSON.stringify(cases));
      res.status(200).json(cases);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

router.get('/:id', (req, res) => {
  const id = String(req.params.id);
  const key = String(req.originalUrl);
  Cases.findById(id)
    .then((cases) => {
      Cache.makeCache(key, JSON.stringify(cases));
      res.status(200).json(cases);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

router.get('/:id/view-pdf', (req, res) => {
  const id = String(req.params.id);
  AWS.make_params(id)
    .then((params) => {
      AWS.fetch_pdf_view(params, res);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

router.get('/:id/download-pdf', (req, res) => {
  // * returns pdf of ORIGINAL case
  const id = String(req.params.id);
  AWS.make_params(id)
    .then((params) => {
      AWS.fetch_pdf_download(params, res);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

router.get('/:id/download-csv', Cache.csvCache, (req, res) => {
  const id = String(req.params.id);
  const key = String(req.originalUrl);
  Cases.writeCSV(id)
    .then((csv) => {
      Cache.makeCache(key, CSV.stringify(csv));
      res.header('Content-Type', 'text/csv');
      res.attachment(`${id}_data.csv`);
      res.status(200).send(csv);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

module.exports = router;
