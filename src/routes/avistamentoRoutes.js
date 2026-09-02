const express = require("express");

const {
    listarAvistamentos,
    buscarAvistamento,
    criarAvistamento,
    atualizarAvistamento,
    deletarAvistamento
} = require("../controllers/avistamentoController");

const router = express.Router();

router.get("/", listarAvistamentos);
router.get("/:id", buscarAvistamento);
router.post("/", criarAvistamento);
router.put("/:id", atualizarAvistamento);
router.delete("/:id", deletarAvistamento);

module.exports = router;