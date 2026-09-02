import express from "express";

import {
  listarAvistamentos,
  buscarAvistamento,
  criarAvistamento,
  atualizarAvistamento,
  deletarAvistamento,
} from "../controllers/avistamentoController";

const router = express.Router();

router.get("/", listarAvistamentos);
router.get("/:id", buscarAvistamento);
router.post("/", criarAvistamento);
router.put("/:id", atualizarAvistamento);
router.delete("/:id", deletarAvistamento);

export default router;
