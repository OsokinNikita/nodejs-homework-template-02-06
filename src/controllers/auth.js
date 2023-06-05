const { User } = require("../models/user");
const { ctrlWrapper, httpError } = require("../helpers");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = process.env;
const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { name, email, password, subscription } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw httpError(409, `User with ${email} already exist`);
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  await User.create({
    name,
    email,
    password: hashPassword,
    subscription,
    avatarURL,
  });
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

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const img = await jimp.read(tempUpload);
  await img.resize(250, 250).writeAsync(tempUpload);
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
