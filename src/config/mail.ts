import nodemailer from "nodemailer"
import IORedis from "ioredis";
 export  const transporter =nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'code63650@gmail.com',
    pass: 'glgk zmwj tglq jbha'
  }
});

  export const Sendmail=async(to:string,subject:string,body:string)=>{

    console.log("preparing for sending")
    

     const info= await transporter.sendMail({
          from: 'code63650@gmail.com', 
          to:to, 
          subject: "verify your email", 
          html:body
        });
        console.log(info)

  
}
      

