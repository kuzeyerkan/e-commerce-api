const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token; // token degeri req.signedCookies'e esit oluyor
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
  try {
    const { name, userId, role } = isTokenValid({ token });
    // const isTokenValid = ({ token }) => {
    //   return jwt.verify(token, "jwtSecret");
    // };

    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalidd");
  }
};
//destructure roles, roles come from to hardcode. we added on route after that it comes to authorizePermission
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthenticatedError(
        "Unauthorized to acces this route"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
