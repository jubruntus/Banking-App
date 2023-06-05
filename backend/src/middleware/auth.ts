import { RequestHandler } from "express";
import { UnauthenticatedError } from "../errors";

export const requiresAuth: RequestHandler = (req, res, next) => {
  if (req.session.username) {
    next();
  } else {
    console.log(req.session);
    next(new UnauthenticatedError("User not authenticated"));
  }
};
