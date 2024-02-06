import {PrismaClient} from "@prisma/client"
import * as crypto from "crypto-js"
const examplePass = crypto.SHA256("example").toString()
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
        where: { id:100, email: "example@example.com" },
        update: {},
        create: {
            email: "example@example.com",
            password: examplePass
        }
    })
    const film = await prisma.film.upsert({
        where: {id:1},
        update: {},
        create:{
            name: "Blade Runner 2049 2017 HDRip 1.45 om lv scarabey.avi",
            link: "static/media/Blade Runner 2049 2017 HDRip 1.45 om lv scarabey.avi"
        }
    })
}
main().then(async () => {await prisma.$disconnect()}).catch(async (e) => {
    console.log(e)
    await prisma.$disconnect()
    process.exit(1)
})