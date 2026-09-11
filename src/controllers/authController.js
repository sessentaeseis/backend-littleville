import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import prisma from "../lib/prisma.js"

function usuarioSemSenha(usuario) {
  const { senha, ...dados } = usuario
  return dados
}

function gerarToken(usuario) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado")
  }

  return jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )
}

export async function registrar(req, res) {
  try {
    const { nome, email, senha } = req.body

    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof senha !== "string" ||
      senha.length < 6
    ) {
      return res.status(400).json({
        erro: "Informe nome, email e uma senha com pelo menos 6 caracteres."
      })
    }

    const emailNormalizado = email.trim().toLowerCase()
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: emailNormalizado }
    })

    if (usuarioExistente) {
      return res.status(409).json({ erro: "Email já cadastrado" })
    }

    const senhaHash = await bcrypt.hash(senha, 12)
    const usuario = await prisma.user.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        senha: senhaHash
      }
    })

    return res.status(201).json({ usuario: usuarioSemSenha(usuario) })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return res.status(500).json({ erro: "Erro ao registrar usuário" })
  }
}

export async function me(req, res) {
  // req.user já vem populado (sem a senha) pelo authMiddleware
  return res.status(200).json({ usuario: req.user })
}

export async function login(req, res) {
  try {
    const { email, senha } = req.body

    if (typeof email !== "string" || typeof senha !== "string") {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" })
    }

    const usuario = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: "Email ou senha inválidos" })
    }

    return res.status(200).json({
      token: gerarToken(usuario),
      usuario: usuarioSemSenha(usuario)
    })
  } catch (error) {
    console.error("Erro ao realizar login:", error)
    return res.status(500).json({ erro: "Erro ao realizar login" })
  }
}
