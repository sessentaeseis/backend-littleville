import "dotenv/config"

import express from "express"
import cors from "cors"

import avistamentoRoutes from "./routes/avistamentoRoutes.js"
import authRoutes from "./routes/authRoutes.js"

const app = express()

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://littleville.netlify.app",
  ],
}))
app.use(express.json())

app.use("/av", avistamentoRoutes)
app.use("/auth", authRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})