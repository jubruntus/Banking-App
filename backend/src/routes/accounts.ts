import express from "express";
import {
  createUser,
  getAuthenticatedUser,
  login,
  logout,
  closeAccount,
} from "../controllers/accounts";
import { requiresAuth } from "../middleware/auth";
const router = express.Router();
router.get("/", requiresAuth, getAuthenticatedUser);
router.post("/register", createUser);
router.post("/login", login);
router.delete("/", requiresAuth, closeAccount);
router.post("/logout", requiresAuth, logout);

export default router;
