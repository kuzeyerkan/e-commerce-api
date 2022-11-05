const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, "jwtSecret", {
    expiresIn: "1d",
  });
  return token;
};

const isTokenValid = ({ token }) => {
  return jwt.verify(token, "jwtSecret");
};

const attachCookiesToREsponse = ({ res, user }) => {
  const token = createJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    // secure: false, // productionda false, suanlik true
    signed: true,
  });
};

module.exports = { createJWT, isTokenValid, attachCookiesToREsponse };
