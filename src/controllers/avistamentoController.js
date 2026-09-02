import prisma from "../lib/prisma.js"

export async function listarAvistamentos(req, res) {
  try {
    const avistamentos = await prisma.avistamento.findMany({
      orderBy: { createdAt: "desc" }
    })

    return res.status(200).json(avistamentos)
  } catch (error) {
    console.error("Erro ao listar avistamentos:", error)
    return res.status(500).json({ erro: "Erro ao listar avistamentos" })
  }
}

export async function buscarAvistamento(req, res) {
  try {
    const { id } = req.params

    const avistamento = await prisma.avistamento.findUnique({
      where: { id }
    })

    if (!avistamento) {
      return res.status(404).json({ erro: "Avistamento não encontrado" })
    }

    return res.status(200).json(avistamento)
  } catch (error) {
    console.error("Erro ao buscar avistamento:", error)
    return res.status(500).json({ erro: "Erro ao buscar avistamento" })
  }
}

export async function criarAvistamento(req, res) {
  try {
    const {
      titulo,
      descricao,
      criatura,
      localizacao,
      data,
      confianca
    } = req.body

    if (
      !titulo ||
      !descricao ||
      !criatura ||
      !localizacao ||
      !data ||
      confianca === undefined
    ) {
      return res.status(400).json({
        erro: "Campos obrigatórios ausentes: titulo, descricao, criatura, localizacao, data e confianca."
      })
    }

    const avistamento = await prisma.avistamento.create({
      data: {
        titulo,
        descricao,
        criatura,
        localizacao,
        data: new Date(data),
        confianca: Number(confianca),
        userId: req.user.id
      }
    })

    return res.status(201).json(avistamento)
  } catch (error) {
    console.error("Erro ao criar avistamento:", error)
    return res.status(500).json({ erro: "Erro ao criar avistamento" })
  }
}

export async function atualizarAvistamento(req, res) {
  try {
    const { id } = req.params
    const {
      titulo,
      descricao,
      criatura,
      localizacao,
      data,
      confianca
    } = req.body

    const avistamentoExistente = await prisma.avistamento.findUnique({
      where: { id, userId: req.user.id }
    })

    if (!avistamentoExistente) {
      return res.status(404).json({ erro: "Avistamento não encontrado" })
    }

    const dataUpdate = {}

    if (titulo !== undefined) dataUpdate.titulo = titulo
    if (descricao !== undefined) dataUpdate.descricao = descricao
    if (criatura !== undefined) dataUpdate.criatura = criatura
    if (localizacao !== undefined) dataUpdate.localizacao = localizacao
    if (data !== undefined) dataUpdate.data = new Date(data)
    if (confianca !== undefined) dataUpdate.confianca = Number(confianca)
    const avistamento = await prisma.avistamento.update({
      where: { id },
      data: dataUpdate
    })

    return res.status(200).json(avistamento)
  } catch (error) {
    console.error("Erro ao atualizar avistamento:", error)
    return res.status(500).json({ erro: "Erro ao atualizar avistamento" })
  }
}

export async function deletarAvistamento(req, res) {
  try {
    const { id } = req.params

    const avistamentoExistente = await prisma.avistamento.findUnique({
      where: { id, userId: req.user.id }
    })

    if (!avistamentoExistente) {
      return res.status(404).json({ erro: "Avistamento não encontrado" })
    }

    await prisma.avistamento.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error("Erro ao deletar avistamento:", error)
    return res.status(500).json({ erro: "Erro ao deletar avistamento" })
  }
}