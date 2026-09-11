import prisma from "../lib/prisma.js"

function comentarioComAutor(comentario) {
  return {
    id: comentario.id,
    texto: comentario.texto,
    avistamentoId: comentario.avistamentoId,
    userId: comentario.userId,
    createdAt: comentario.createdAt,
    autor: comentario.user ? { id: comentario.user.id, nome: comentario.user.nome } : null,
  }
}

export async function listarComentarios(req, res) {
  try {
    const { id } = req.params

    const avistamento = await prisma.avistamento.findUnique({ where: { id } })
    if (!avistamento) {
      return res.status(404).json({ erro: "Avistamento não encontrado" })
    }

    const comentarios = await prisma.comentario.findMany({
      where: { avistamentoId: id },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, nome: true } } },
    })

    return res.status(200).json(comentarios.map(comentarioComAutor))
  } catch (error) {
    console.error("Erro ao listar comentários:", error)
    return res.status(500).json({ erro: "Erro ao listar comentários" })
  }
}

export async function criarComentario(req, res) {
  try {
    const { id } = req.params
    const { texto } = req.body

    if (typeof texto !== "string" || !texto.trim()) {
      return res.status(400).json({ erro: "Informe o texto do comentário." })
    }

    const avistamento = await prisma.avistamento.findUnique({ where: { id } })
    if (!avistamento) {
      return res.status(404).json({ erro: "Avistamento não encontrado" })
    }

    const comentario = await prisma.comentario.create({
      data: {
        texto: texto.trim(),
        avistamentoId: id,
        userId: req.user.id,
      },
      include: { user: { select: { id: true, nome: true } } },
    })

    return res.status(201).json(comentarioComAutor(comentario))
  } catch (error) {
    console.error("Erro ao criar comentário:", error)
    return res.status(500).json({ erro: "Erro ao criar comentário" })
  }
}

export async function deletarComentario(req, res) {
  try {
    const { comentarioId } = req.params

    // findFirst (não findUnique) porque precisamos filtrar por dois campos
    // (id + userId) e "id" sozinho não garante que o comentário é do usuário logado.
    const comentarioExistente = await prisma.comentario.findFirst({
      where: { id: comentarioId, userId: req.user.id },
    })

    if (!comentarioExistente) {
      return res.status(404).json({ erro: "Comentário não encontrado" })
    }

    await prisma.comentario.delete({ where: { id: comentarioId } })

    return res.status(204).send()
  } catch (error) {
    console.error("Erro ao deletar comentário:", error)
    return res.status(500).json({ erro: "Erro ao deletar comentário" })
  }
}
