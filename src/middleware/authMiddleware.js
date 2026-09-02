import jwt from "jsonwebtoken"

import prisma from "../lib/prisma.js"

export default async function authMiddleware(req, res, next) {
  try {
    const authorization = req.headers.authorization
    const [tipo, token] = authorization?.split(" ") ?? []

    if (tipo !== "Bearer" || !token || !process.env.JWT_SECRET) {
      return res.status(401).json({ erro: "Token de autenticação ausente ou inválido" })
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (typeof payload !== "object" || !payload.id) {
      return res.status(401).json({ erro: "Token de autenticação inválido" })
    }

    const usuario = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, nome: true, email: true, createdAt: true }
    })

    if (!usuario) {
      return res.status(401).json({ erro: "Usuário não encontrado" })
    }

    req.user = usuario
    return next()
  } catch (error) {
    return res.status(401).json({ erro: "Token de autenticação inválido ou expirado" })
  }
}
