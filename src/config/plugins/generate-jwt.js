import jwt from "jsonwebtoken";
import { envs } from "../enviroments/enviroments.js";

const generateJWT = (id) => {
  return new Promise((resolve, reject) => {
    const payload = { id };

    jwt.sign(
      payload,
      envs.JWT_SECRET,
      {
        expiresIn: envs.JWT_EXPIRES_IN,
      },
      (err, token) => {
        if (err) reject(err);

        resolve(token);
      },
    );
  });
};

export default generateJWT;
