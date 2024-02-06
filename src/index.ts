import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'
import * as hbs from "express-handlebars" ;
import path from "path";
import cookieParser from "cookie-parser";
import * as fs from "fs";
import {createCanvas, CanvasRenderingContext2D} from "canvas";
import * as crypto from "crypto-js"



const prisma = new PrismaClient;


// https://gist.github.com/wesbos/1bb53baf84f6f58080548867290ac2b5
const alternateCapitals = (str: string) =>
    [...str].map((char, i) => char[`to${i % 2 ? "Upper" : "Lower"}Case`]()).join("");

// Get a random string of alphanumeric characters
const randomText = () =>
    alternateCapitals(
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

const FONTBASE = 200;
const FONTSIZE = 35;

// Get a font size relative to base size and canvas width
const relativeFont = (width: number) => {
    const ratio = FONTSIZE / FONTBASE;
    const size = width * ratio;
    return `${size}px serif`;
};

// Get a float between min and max
const arbitraryRandom = (min: number, max: number) => Math.random() * (max - min) + min;

// Get a rotation between -degrees and degrees converted to radians
const randomRotation = (degrees = 15) => (arbitraryRandom(-degrees, degrees) * Math.PI) / 180;

// Configure captcha text
const configureText = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.font = relativeFont(width);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const text = randomText();
    ctx.fillText(text, width / 2, height / 2);
    return text;
};

// Get a PNG dataURL of a captcha image
const generate = (width: number, height: number) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.rotate(randomRotation());
    const text = configureText(ctx, width, height);
    return {
        image: canvas.toDataURL(),
        text: text
    };
};

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
   const passw_crypt = crypto.SHA256(password).toString()
   try {
   const post = await prisma.user.create({
       data: {
           email,
           password: passw_crypt
       }
   })
   res.redirect(301, "/")
   } catch(e) {
       console.log(e)
       console.log({email, passw_crypt})
       console.log(req.body)
       res.json(e)
   }
});
app.get('/log', async (req: Request, res: Response)=> {
   const usr_email = '' || req.query.email!.toString();
   const usr_password = '' || req.query.password!.toString();
   const passw_crypt = crypto.SHA256(usr_password).toString()
   try{
       const get = await prisma.user.findFirst({
           select: {
               id: true,
               email: true
           },
           where: {
               email : usr_email,
               password : passw_crypt
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

app.get("/video", (req: Request, res: Response)=>{
    res.sendFile(__dirname+`/views/film.html`)
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

app.get("/film", async (req: Request, res: Response) => {
    console.log("film")
    const films = await prisma.film.findMany()
    console.log(films[0].name)
    const range = req.headers.range;
    if (!range){
        res.status(400).send("Requires Range header")
    }
    const videoSize = fs.statSync(__dirname + "/../" + films[0].link).size
    console.log(videoSize)
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range?.replace(/\D/g, ""))
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    }
    res.writeHead(206,headers);
    const videoStream = fs.createReadStream(__dirname + "/../" + films[0].link, {start, end})
    videoStream.pipe(res)
});

app.get("/captcha/:width?/:height?/", (req: Request, res: Response) => {
    const width = parseInt(req.params.width) || 200;
    const height = parseInt(req.params.height) || 100;
    const { image, text } = generate(width, height);
    res.cookie("captcha", text)
    res.send(`<img class="captcha" src="${image}" />`);
});

app.post("/check-captcha", (req: Request, res: Response) =>{
    const capt_text = req.cookies.captcha
    const {inp} = req.body
    if (inp === capt_text) {
        console.log("User provided: " + inp)
        console.log("Cookie got: " + capt_text)
        res.send(`<p>Правильно</p>`)
    } else {
        console.log("User provided: " + inp)
        console.log("Cookie got: " + capt_text)
        res.send(`<p>Неправильно</p>`)
    }
})

app.post("/search", async (req: Request, res: Response) => {
    const {name} = req.body
    // console.log(name)
    if (name !== ""){
        const search = await prisma.products.findFirst({
            select: {
                name: true,
                price: true
            },
            where: {
                name: name
            }
        }).then((name) => {
            if (name !== null) {
                res.send(`<div>${name!.name} | ${name!.price}</div>`)
            } else {
                res.send(`<div>Found nothing</div>`)
            }
        })
    }
})

app.listen(port, () =>{
    console.log(`[server]: Server is running at http://localhost:${port}`);
});