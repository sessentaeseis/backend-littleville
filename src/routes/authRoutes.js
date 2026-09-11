import express from "express"

import { registrar, login, me } from "../controllers/authController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/register", registrar)
router.post("/login", login)
router.get("/me", authMiddleware, me)

export default router
