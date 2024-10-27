import nodemailer from "nodemailer"
import IORedis from "ioredis";
 export  const transporter =nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'code63650@gmail.com',
    pass: 'tzpa yxko qkdj vvle'
  }
});

  export const Sendmail=async(to:string,subject:string,body:string)=>{

    console.log("preparing for sending")
    console.log("The type of IORedis is",typeof(IORedis))
    

     const info= await transporter.sendMail({
          from: 'check1@gmail.com', 
          to:to, 
          subject: "verify your email", 
          html:body
        });
        console.log(info)

  
}
      

