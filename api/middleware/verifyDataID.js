const Judge = require('../judges/judgeModel');
const Case = require('../cases/caseModel');

// * Middleware for Judge & Case

const verifyJudge = (req, res, next) => {
  const judge_name = String(req.params.judge_name);
  Judge.findById(judge_name)
    .then(() => {
      next();
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
};

const verifyCase = (req, res, next) => {
  const id = String(req.params.id);
  Case.findById(id)
    .then(() => {
      next();
    })
    .catch((err) => {
      res.status(404).json({ message: err.message });
    });
};

module.exports = {
  verifyCase,
  verifyJudge,
};
