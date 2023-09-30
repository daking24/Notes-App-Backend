import { RequestHandler } from "express";
import createHttpError from "http-errors";
import user from "../models/user";
import bcrypt from "bcrypt";

// Get Authenticated user
export const getAuthenticatedUser: RequestHandler =async (req, res, next) => {
  try {
    const authenticatedUser = await user.findById(req.session.userId).select("+email").exec();
    res.status(200).json(authenticatedUser);
  } catch (error) {
    next(error);
  }
}

interface SignUpBody {
  username?: string,
  email?: string,
  password?: string,
}

export const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> =async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;  

  try {
    if (!username || !email || !password) {
      throw createHttpError(400, "Missing required fields");
    } 
      
    const existingUser = await user.findOne({ username: username }).exec();

    if (existingUser) {
      throw createHttpError(409, "Username already exists");
    }

    const existingEmail = await user.findOne({ email: email }).exec();

    if (existingEmail) {
      throw createHttpError(409, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

    req.session.userId = newUser._id;

    

    res.status(201).json(newUser);
  }catch (error) {
    next(error);
  }
}

interface LoginBody {
  username?: string,
  password?: string,
}

export const login: RequestHandler<unknown, unknown, LoginBody, unknown> =async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    if (!username || !password) {
      throw createHttpError(400, "Missing required fields");
    }

    const userx = await user.findOne({ username: username }).select("+password +email").exec();

    if (!userx) {
      throw createHttpError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, userx.password);

    if (!isPasswordValid) {
      throw createHttpError(401, "Invalid credentials");
    }

    req.session.userId = userx._id;
    res.status(200).json(userx); 
  }catch (error) {
    next(error);
  }
};

// Logout
export const logout: RequestHandler = async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(201);
    }
  });
}