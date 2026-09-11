// Popula o banco com dados de exemplo para a demonstração ao vivo.
// Rodar com: npx tsx prisma/seed.js
import "dotenv/config"
import bcrypt from "bcrypt"
import prisma from "../src/lib/prisma.js"

const USUARIOS = [
  { nome: "Ana Ferreira", email: "ana@littleville.com", senha: "123456" },
  { nome: "Bruno Silva", email: "bruno@littleville.com", senha: "123456" },
  { nome: "Carla Mendes", email: "carla@littleville.com", senha: "123456" },
]

// Coordenadas reais em torno de uma pequena cidade fictícia (região de
// Florianópolis/SC), só para os pins aparecerem espalhados no mapa.
const AVISTAMENTOS = [
  {
    titulo: "Vulto enorme na trilha da montanha",
    descricao: "Vi uma silhueta de mais de 2 metros atravessando a trilha ao anoitecer.",
    criatura: "Pé Grande",
    localizacao: "Trilha da Lagoa do Peri",
    latitude: -27.7304,
    longitude: -48.5083,
    data: "2026-08-02",
    confianca: 72,
  },
  {
    titulo: "Pegadas gigantes na lama",
    descricao: "Encontrei pegadas de quase 40cm perto do riacho, ninguém da região tem esse tamanho de pé.",
    criatura: "Pé Grande",
    localizacao: "Riacho da Barra da Lagoa",
    latitude: -27.5726,
    longitude: -48.4231,
    data: "2026-08-10",
    confianca: 65,
  },
  {
    titulo: "Luzes estranhas sobre o mar",
    descricao: "Três luzes piscando em formação triangular, sem ruído nenhum.",
    criatura: "OVNI",
    localizacao: "Praia Mole",
    latitude: -27.5911,
    longitude: -48.4048,
    data: "2026-08-15",
    confianca: 40,
  },
  {
    titulo: "Criatura anfíbia na lagoa",
    descricao: "Algo saiu da água, ficou me encarando por uns segundos e voltou a mergulhar.",
    criatura: "Homem-Peixe",
    localizacao: "Lagoa da Conceição",
    latitude: -27.6045,
    longitude: -48.4646,
    data: "2026-08-20",
    confianca: 55,
  },
  {
    titulo: "Uivo diferente de tudo que já ouvi",
    descricao: "Um uivo grave, bem mais longo que o de um lobo comum, vindo da mata fechada.",
    criatura: "Lobisomem",
    localizacao: "Maciço da Costeira",
    latitude: -27.6289,
    longitude: -48.4877,
    data: "2026-08-25",
    confianca: 48,
  },
  {
    titulo: "Sombra correndo entre as árvores",
    descricao: "Duas testemunhas viram uma sombra se movendo rápido demais para ser humano.",
    criatura: "Pé Grande",
    localizacao: "Parque Municipal da Lagoa do Peri",
    latitude: null,
    longitude: null,
    data: "2026-08-28",
    confianca: 30,
  },
  {
    titulo: "Círculo na plantação",
    descricao: "Um padrão geométrico perfeito apareceu do nada numa plantação de mandioca.",
    criatura: "OVNI",
    localizacao: "Ratones",
    latitude: -27.5024,
    longitude: -48.4917,
    data: "2026-09-01",
    confianca: 60,
  },
]

const COMENTARIOS_POR_TITULO = {
  "Vulto enorme na trilha da montanha": [
    "Eu também já vi algo parecido lá, mas de longe.",
    "Alguém mais tem foto? Seria importante registrar.",
  ],
  "Pegadas gigantes na lama": [
    "Isso é sério, deveríamos avisar a prefeitura.",
  ],
  "Luzes estranhas sobre o mar": [
    "Pode ter sido só um drone, mas o formato é estranho mesmo.",
  ],
}

async function upsertUsuario({ nome, email, senha }) {
  const existente = await prisma.user.findUnique({ where: { email } })
  if (existente) return existente

  const senhaHash = await bcrypt.hash(senha, 12)
  return prisma.user.create({
    data: { nome, email, senha: senhaHash },
  })
}

async function main() {
  console.log("Criando usuários de demonstração...")
  const usuarios = []
  for (const dados of USUARIOS) {
    usuarios.push(await upsertUsuario(dados))
  }

  console.log("Criando avistamentos de demonstração...")
  for (let i = 0; i < AVISTAMENTOS.length; i++) {
    const dados = AVISTAMENTOS[i]
    const autor = usuarios[i % usuarios.length]

    const jaExiste = await prisma.avistamento.findFirst({
      where: { titulo: dados.titulo },
    })
    if (jaExiste) continue

    const avistamento = await prisma.avistamento.create({
      data: {
        titulo: dados.titulo,
        descricao: dados.descricao,
        criatura: dados.criatura,
        localizacao: dados.localizacao,
        latitude: dados.latitude,
        longitude: dados.longitude,
        data: new Date(dados.data),
        confianca: dados.confianca,
        userId: autor.id,
      },
    })

    const textos = COMENTARIOS_POR_TITULO[dados.titulo]
    if (textos) {
      for (let j = 0; j < textos.length; j++) {
        const comentador = usuarios[(i + j + 1) % usuarios.length]
        await prisma.comentario.create({
          data: {
            texto: textos[j],
            avistamentoId: avistamento.id,
            userId: comentador.id,
          },
        })
      }
    }
  }

  console.log("Seed concluído.")
  console.log("Login de teste: ana@littleville.com / 123456")
}

main()
  .catch((err) => {
    console.error("Erro ao rodar o seed:", err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
