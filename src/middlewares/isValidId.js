const { isValidObjectId } = require("mongoose");
const { httpError } = require("../helpers");

const isValidId = (req, res, next) => {
  const { contactId } = req.params;
  const IsCorrectId = isValidObjectId(contactId);
  if (!IsCorrectId) {
    next(httpError(400, `${contactId} is not correct id format`));
  }
  next();
};

module.exports = isValidId;
