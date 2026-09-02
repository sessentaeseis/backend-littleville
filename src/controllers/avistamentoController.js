const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function listarAvistamentos(req, res) {
    try {
        const avistamentos = await prisma.avistamento.findMany();

        res.status(200).json(avistamentos);
    } catch (error) {
        res.status(500).json({
            erro: "Erro ao listar avistamentos"
        });
    }
}

async function buscarAvistamento(req, res) {
    try {
        const id = Number(req.params.id);

        const avistamento = await prisma.avistamento.findUnique({
            where: {
                id: id
            }
        });

        if (!avistamento) {
            return res.status(404).json({
                erro: "Avistamento não encontrado"
            });
        }

        res.status(200).json(avistamento);
    } catch (error) {
        res.status(500).json({
            erro: "Erro ao buscar avistamento"
        });
    }
}

async function criarAvistamento(req, res) {
    try {
        const {
            titulo,
            descricao,
            criatura,
            localizacao,
            data
        } = req.body;

        const avistamento = await prisma.avistamento.create({
            data: {
                titulo,
                descricao,
                criatura,
                localizacao,
                data: new Date(data)
            }
        });

        res.status(201).json(avistamento);
    } catch (error) {
        res.status(500).json({
            erro: "Erro ao criar avistamento"
        });
    }
}

async function atualizarAvistamento(req, res) {
    try {
        const id = Number(req.params.id);

        const {
            titulo,
            descricao,
            criatura,
            localizacao,
            data
        } = req.body;

        const avistamento = await prisma.avistamento.update({
            where: {
                id: id
            },
            data: {
                titulo,
                descricao,
                criatura,
                localizacao,
                data: new Date(data)
            }
        });

        res.status(200).json(avistamento);
    } catch (error) {
        res.status(500).json({
            erro: "Erro ao atualizar avistamento"
        });
    }
}

async function deletarAvistamento(req, res) {
    try {
        const id = Number(req.params.id);

        await prisma.avistamento.delete({
            where: {
                id: id
            }
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            erro: "Erro ao deletar avistamento"
        });
    }
}

module.exports = {
    listarAvistamentos,
    buscarAvistamento,
    criarAvistamento,
    atualizarAvistamento,
    deletarAvistamento
};