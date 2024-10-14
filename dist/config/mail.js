import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
        user: "35e165307054a4",
        pass: "0723246c107f4a"
    }
});
export const Sendmail = async (to, subject, body) => {
    console.log("preparing for sending");
    console.log(to, subject, body);
    const info = await transporter.sendMail({
        from: 'check1@gmail.com',
        to: to,
        subject: "verify your email",
        html: body
    });
    console.log(info);
};
