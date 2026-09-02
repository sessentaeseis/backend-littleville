import express from "express"

import {
  listarAvistamentos,
  buscarAvistamento,
  criarAvistamento,
  atualizarAvistamento,
  deletarAvistamento,
} from "../controllers/avistamentoController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", listarAvistamentos)
router.get("/:id", buscarAvistamento)
router.post("/", authMiddleware, criarAvistamento)
router.put("/:id", authMiddleware, atualizarAvistamento)
router.delete("/:id", authMiddleware, deletarAvistamento)

export default router
