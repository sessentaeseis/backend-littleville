import "dotenv/config";

import express from "express";
import cors from "cors";

import avistamentoRoutes from "./routes/avistamentoRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/av", avistamentoRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});