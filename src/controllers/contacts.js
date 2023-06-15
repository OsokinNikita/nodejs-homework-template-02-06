const { Contact } = require("../models/contact");
const { ctrlWrapper, httpError } = require("../helpers");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite, name, email } = req.query;
  const skip = (page - 1) * limit;

  const searchCriteria = { owner };
  if (favorite) {
    searchCriteria.favorite = favorite;
  }
  if (name) {
    searchCriteria.name = { $regex: name, $options: "i" };
  }
  if (email) {
    searchCriteria.email = { $regex: email, $options: "i" };
  }

  const result = await Contact.find(searchCriteria, "-createdAt -updatedAt", {
    skip,
    limit: Number(limit),
  }).populate("owner", "_id name email");

  res.json(result);
};

const getById = async (req, res) => {
  const { contactId } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOne({ _id: contactId, owner });
  if (!result) {
    throw httpError(404, `Contact with id:${contactId || owner} not found`);
  }
  res.json(result);
};

const add = async (req, res) => {
  const { name, email, phone } = req.body;
  const { _id: owner } = req.user;
  const newContact = await Contact.create({
    name,
    email,
    phone,
    owner,
  });

  res.status(201).json(newContact);
};

const updateById = async (req, res) => {
  const { contactId } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOneAndUpdate(
    { _id: contactId, owner },
    req.body,
    {
      new: true,
    }
  );
  if (!result) {
    throw httpError(404, `Contact with id:${contactId || owner} not found`);
  }
  res.json(result);
};

const updateFavorit = async (req, res) => {
  const { contactId } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOneAndUpdate(
    { _id: contactId, owner },
    req.body,
    {
      new: true,
    }
  );
  if (!result) {
    throw httpError(404);
  }
  res.json(result);
};

const removeById = async (req, res) => {
  const { contactId } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOneAndRemove({ _id: contactId, owner });
  if (!result) {
    throw httpError(`Contact with id=${contactId || owner} not found`);
  }
  res.json({
    message: "contact deleted",
    data: result,
  });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  updateById: ctrlWrapper(updateById),
  updateFavorit: ctrlWrapper(updateFavorit),
  removeById: ctrlWrapper(removeById),
};
