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
app.use(express.static(temps))
app.post('/reg', async (req: Request, res: Response) => {
   const { email, password } = req.body;
   try {
   const post = await prisma.user.create({
       data: {
           email,
           password
       }

   })
   res.json(post)
       res.redirect(301, "/")
   } catch(e) {
       console.log(e)
       console.log({email, password})
       console.log(req.body)
       res.json(e)
       res.redirect(301,"/")
   }
});

app.listen(port, () =>{
    console.log(`[server]: Server is running at http://localhost:${port}`);
});