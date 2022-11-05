const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToREsponse } = require("../utils");
const checkPermissions = require("../utils/checkPermissions");

//getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword;
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  // const checkPermissions = (requestUser, resourceUserId) => {
  //   if (requestUser.role === "admin") return;
  //   if (requestUser.userId === resourceUserId.toString()) return;
  //   throw new CustomError.UnauthenticatedError(
  //     "Not authorized to acces this route"
  //   );
  // };

  res.status(StatusCodes.OK).json({ user });
};
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

//update user with findOneAndUpdate
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError("please provide email and password");
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { email, name },
    { new: true, runValidators: true }
  );
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  attachCookiesToREsponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("please provide both value");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password updated" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
