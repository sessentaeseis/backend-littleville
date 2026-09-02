const express = require("express");
const cors = require("cors");

const avistamentoRoutes = require("./routes/avistamentoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/avistamentos", avistamentoRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});