import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import prismaPackage from "@prisma/client"

const { PrismaClient } = prismaPackage

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })

export default prisma
