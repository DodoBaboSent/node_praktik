import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient;


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const root = process.env.ROOT || './static/';
const temps = process.env.TEMPS || './_temp/'

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.static(root));
app.use("/temps", express.static(temps))
app.disable('etag')
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
       res.cookie("user", get!.email)
       console.log(get!.email)
       res.redirect(301,"/")
   } catch (e){
       console.log(e)
       console.log({usr_email, usr_password})
       console.log(req.body)
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
app.listen(port, () =>{
    console.log(`[server]: Server is running at http://localhost:${port}`);
});