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
      latitude,
      longitude,
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

    const lat = latitude !== undefined && latitude !== null && latitude !== "" ? Number(latitude) : null
    const lng = longitude !== undefined && longitude !== null && longitude !== "" ? Number(longitude) : null

    if ((lat !== null && Number.isNaN(lat)) || (lng !== null && Number.isNaN(lng))) {
      return res.status(400).json({ erro: "Latitude/longitude inválidas." })
    }

    const avistamento = await prisma.avistamento.create({
      data: {
        titulo,
        descricao,
        criatura,
        localizacao,
        latitude: lat,
        longitude: lng,
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
      latitude,
      longitude,
      data,
      confianca
    } = req.body

    // findUnique só aceita campos únicos (id). Para checar também o dono,
    // usamos findFirst com os dois campos na cláusula where.
    const avistamentoExistente = await prisma.avistamento.findFirst({
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
    if (latitude !== undefined) {
      const lat = latitude === null || latitude === "" ? null : Number(latitude)
      if (lat !== null && Number.isNaN(lat)) {
        return res.status(400).json({ erro: "Latitude inválida." })
      }
      dataUpdate.latitude = lat
    }
    if (longitude !== undefined) {
      const lng = longitude === null || longitude === "" ? null : Number(longitude)
      if (lng !== null && Number.isNaN(lng)) {
        return res.status(400).json({ erro: "Longitude inválida." })
      }
      dataUpdate.longitude = lng
    }
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

    const avistamentoExistente = await prisma.avistamento.findFirst({
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