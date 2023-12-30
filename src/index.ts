import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import * as hbs from "express-handlebars" ;
import path from "path";
import cookieParser from "cookie-parser";

const prisma = new PrismaClient;


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const root = process.env.ROOT || './static/';
const temps = process.env.TEMPS || './_temp/'

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.static(root));
app.use(cookieParser())
app.disable('etag')

app.engine('handlebars', hbs.create({
    extname: 'hbs',
}).engine)
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname,'/views'))


app.post('/reg', async (req: Request, res: Response) => {
   const { email, password } = req.body;
   try {
   const post = await prisma.user.create({
       data: {
           email,
           password
       }
   })
   res.redirect(301, "/")
   } catch(e) {
       console.log(e)
       console.log({email, password})
       console.log(req.body)
       res.json(e)
   }
});
app.get('/log', async (req: Request, res: Response)=> {
   const usr_email = '' || req.query.email!.toString();
   const usr_password = '' || req.query.password!.toString();
   try{
       const get = await prisma.user.findFirst({
           select: {
               id: true,
               email: true
           },
           where: {
               email : usr_email,
               password : usr_password
           }
       })
       res.header("Cache-Control", "no-cache, no-store, must-revalidate");
       res.header("Pragma", "no-cache");
       res.header("Expires", "0");
       res.cookie("user", {email: get!.email, id: get!.id})
       console.log(get!.email)
       res.redirect(301,"/")
   } catch (e){
       console.log(e)
       console.log({usr_email, usr_password})
       console.log(req.query.email)
       res.json(e)
   }
});
app.get('/log-out', (req: Request, res: Response) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
    res.clearCookie("user");
    res.redirect(301, "/")
})
app.get('/temps/:temp', async (req: Request, res: Response)=>{
    if (req.params.temp === "cart.hbs"){
        console.log("hit")
        const products = await prisma.products.findMany()
        console.log(products)
        try { res.render("cart.hbs", {
            title: "Products",
            products: products
        }) } catch (e) {
            console.log(e)
        }
    } else {
        try {
            res.render(req.params.temp)
        } catch (e) {
            console.log(e)
        }
    }
})
app.post('/cart', async (req: Request, res: Response) => {
    const req_arr : string[] = Object.values(req.body)
    // console.log(JSON.stringify(req_arr))
    let arr = []
    for (const reqArrKey in req_arr) {
        arr.push(JSON.parse(req_arr[reqArrKey]))
    }
    // console.log(arr)
    // console.log(Object.assign({}, ...cart))
    let arr_ids = arr.map((v) => {
        console.log(v)
        return {"id": v.id}
    })
    // console.log(arr_ids)
    // res.json(Object.assign({}, ...cart))
    if (arr_ids.length !== 0){
    try { const newOrder = await prisma.order.create({
            data: {
                user: {
                    connect: {
                        email: req.cookies.user.email
                    }
                },
                product: {
                    connect: arr_ids
                    }
                }
            })
    res.json(newOrder) } catch (e) {
        console.log(e)
    }} else {
        res.json({err: "Корзина пуста"})
    }
    //res.redirect(301, '/')
})
app.listen(port, () =>{
    console.log(`[server]: Server is running at http://localhost:${port}`);
});