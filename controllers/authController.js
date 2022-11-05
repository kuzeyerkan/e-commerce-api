const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const jwt = require("jsonwebtoken");
const { attachCookiesToREsponse, createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyexist = await User.findOne({ email });
  if (emailAlreadyexist) {
    throw new CustomError.BadRequestError("Email already exist");
  }

  //first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  // then we created a user
  const user = await User.create({ name, email, password, role });

  //jwt setup
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  attachCookiesToREsponse({ res, user: tokenUser });
  // const attachCookiesToREsponse = ({ res, user }) => {
  //   const token = createJWT({ payload: user });
  //   const oneDay = 1000 * 60 * 60 * 24;
  //   res.cookie("token", token, {
  //     httpOnly: true,
  //     expires: new Date(Date.now() + oneDay),
  //     secure: false, // productionda false, suanlik true
  //     signed: true,
  //   });
  // };

  // const token = createJWT({ payload: tokenUser }); //utils-->jwt->createJWT function

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  //JWT SETUP
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  attachCookiesToREsponse({ res, user: tokenUser });
  // const attachCookiesToREsponse = ({ res, user }) => {
  //   const token = createJWT({ payload: user });
  //   const oneDay = 1000 * 60 * 60 * 24;
  //   res.cookie("token", token, {
  //     httpOnly: true,
  //     expires: new Date(Date.now() + oneDay),
  //     // secure: false, // productionda false, suanlik true
  //     signed: true,
  //   });
  // };

  // const token = createJWT({ payload: tokenUser }); //utils-->jwt->createJWT function

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

module.exports = { register, login, logout };
