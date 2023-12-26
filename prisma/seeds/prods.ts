import {PrismaClient} from "@prisma/client"
const prisma = new PrismaClient()
async function main(){
    const samsung = await prisma.products.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: "Samsung M52",
            price: 50_000,
            quantity: 10
        }
    })
    const poko = await prisma.products.upsert({
        where: { id: 2},
        update: {},
        create: {
            name: "poko",
            price: 40_000,
            quantity: 10
        }
    })
    const iphone = await prisma.products.upsert({
        where: { id: 3 },
        update: {},
        create: {
            name: "iphone x",
            price: 150_000,
            quantity: 10
        }
    })
    const user = await prisma.user.upsert({
        where: { id:100 },
        update: {},
        create: {
            email: "example@example.com",
            password: "example"
        }
    })
}
main().then(async () => {await prisma.$disconnect()}).catch(async (e) => {
    console.log(e)
    await prisma.$disconnect()
    process.exit(1)
})