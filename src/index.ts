import  express,{Application,Request,Response} from "express";
import "dotenv/config"
import path from 'path'
import {fileURLToPath} from "url"
import ejs from 'ejs'
import { Sendmail } from "./config/mail.js";
import { emailQueue, emailQueueName } from "./jobs/EmailJob.js";
import router from "./routes/authRoutes.js";
const _dirname=path.dirname(fileURLToPath(import.meta.url))





const app:Application=express();
const PORT=process.env.PORT || 7000;

app.use(express.json());
app.use(express.urlencoded({extended:false}));
//set view engine
app.set("view engine","ejs");
app.set("views",path.resolve(_dirname,"./views"));
app.use("/",router)



app.get("/",async(req:Request,res:Response)=>{
    const html=await ejs.renderFile(_dirname+'/views/emails/welcome.ejs',{name:"Sudarshan Dhakal"})
   
    
 res.render("emails/welcome",{name:"Sudarshan DHakal"})
})
app.get("/sendmail",async(req:Request,res:Response)=>{
  const html=await ejs.renderFile(_dirname+'/views/emails/welcome.ejs',{name:"Sudarshan Dhakal"})
  await emailQueue.add(emailQueueName,{to:"check@getPrismaClient.com",
    subject:"testing",
    body:html
  
})
res.render(html)
  
})




app.listen(PORT,()=>console.log(`Server running on ${PORT}`))