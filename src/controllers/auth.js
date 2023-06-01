const { User } = require("../models/user");
const { ctrlWrapper, httpError } = require("../helpers");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { name, email, password, subscription } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw httpError(409, `User with ${email} already exist`);
  }

  const hashPassword = await bcrypt.hash(password, 10);

  await User.create({ name, email, password: hashPassword, subscription });
  res.status(201).json({
    user: { name, email, subscription },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw httpError(401, "Email or password invalid");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw httpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  const result = await User.findByIdAndUpdate(user._id, { token });
  const { subscription } = result;

  res.json({
    token,
    user: {
      email,
      subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { id, email, subscription } = req.user;
  const result = await User.findById(id);

  if (!result) {
    throw httpError(401, "Not authorized");
  }

  res.status(200)({
    user: {
      email,
      subscription,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  const result = await User.findByIdAndUpdate(_id, { token: "" });
  if (!result) {
    throw httpError(401, "Not authorized");
  }

  res.status(204).json(_id);
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const result = await User.findByIdAndUpdate(
    _id,
    { ...req.body },
    { new: true }
  );
  res.status(200).json(result);
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
};
