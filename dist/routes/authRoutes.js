import { Router } from "express";
import { forgetPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../validation/authValidation.js";
import { prisma } from "../config/database.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { emailQueue, emailQueueName } from "../jobs/EmailJob.js";
import { checkDateHourDifference, formatError, generateRandomNum, renderEmailEjs } from "../helper.js";
import logger from "../config/logger.js";
const router = Router();
//* login route
router.post("/login", async (req, res) => {
    try {
        const body = req.body;
        const payload = loginSchema.parse(body);
        //check user exist or not
        let user = await prisma.user.findUnique({
            where: { email: payload.email }
        });
        if (!user) {
            return res.status(404).json({ error: "email not found" });
        }
        //not-verified
        if (user.email_verified_at == null) {
            return res.status(422).json({ error: "Email not verified.Please check your email and verify first" });
        }
        const compare = await bcrypt.compare(payload.password, user.password);
        if (!compare) {
            return res.status(422).json({ error: "Invalid creditentials" });
        }
        const JWTpayload = {
            id: user.id,
            username: user.name,
            password: user.password
        };
        const token = jwt.sign(JWTpayload, "sudarshan", { expiresIn: "365d" });
        const resPayload = {
            id: user.id,
            username: user.name,
            password: user.password,
            token: 'Bearer ${token}'
        };
        return res.json({
            message: "Logged in sucessfully",
            data: resPayload
        });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid login data", errors });
        }
        else {
            logger.error({ type: "Auth Error", body: error });
            res.status(500).json({
                error: "Something went wrong.please try again!",
                data: error,
            });
        }
    }
});
router.post("/register", async (req, res) => {
    try {
        const { body } = req;
        const payload = registerSchema.parse(body);
        let { username, email, password } = payload;
        //check out other user exist
        let user = await prisma.user.findUnique({
            where: { email: email }
        });
        if (user) {
            return res.status(422).json({ error: "User already exist" });
        }
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(password, salt);
        const id = generateRandomNum();
        const token = await bcrypt.hash(id, salt);
        const url = `http:localhost:7000/verify/email/?email=${email}&token=${token}`;
        console.log("Working till url");
        const html = await renderEmailEjs("verifymail", { name: username, url: url });
        await emailQueue.add(emailQueueName, {
            to: email,
            subject: "Please verify your email",
            body: html
        });
        await prisma.user.create({
            data: {
                name: payload.username,
                email: payload.email,
                password: payload.password,
                email_verify_token: token,
            },
        });
        return res.json({ message: "User created successfully!" });
    }
    catch (error) {
        console.log("The errir is ", error);
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            logger.error({ type: "Register Error", body: JSON.stringify(error) });
            res
                .status(500)
                .json({ error: "Something went wrong.please try again!", data: error });
        }
    }
});
router.post('/forgetpassword', async (req, res) => {
    try {
        const { body } = req.body;
        const payload = await forgetPasswordSchema.parse(body);
        const { email } = payload;
        let user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const salt = await bcrypt.genSalt(10);
        const id = generateRandomNum();
        const token = await bcrypt.hash(id, salt);
        await prisma.user.update({
            data: {
                password_reset_token: token,
                token_send_at: new Date().toISOString(),
            },
            where: {
                email: payload.email,
            },
        });
        const url = `http://localhost:7000/reset-password?email=${email}&token=${token}`;
        const html = await renderEmailEjs("forget-password", {
            name: user.name,
            url: url,
        });
        await emailQueue.add(emailQueueName, {
            to: payload.email,
            subject: "Forgot Password",
            html: html,
        });
        return res.json({
            message: "Email sent successfully!! please check your email.",
        });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            logger.error({ type: "Auth Error", body: error });
            return res.status(500).json({
                error: "Something went wrong.please try again!",
                data: error,
            });
        }
    }
});
router.post("/reset-password", async (req, res) => {
    try {
        const body = req.body;
        const payload = resetPasswordSchema.parse(body);
        const user = await prisma.user.findUnique({
            select: {
                email: true,
                password_reset_token: true,
                token_send_at: true,
            },
            where: { email: payload.email },
        });
        if (!user) {
            return res.status(422).json({
                errors: {
                    email: "No Account found with this email.",
                },
            });
        }
        // * Check token
        if (payload.token !== user.password_reset_token) {
            return res.status(422).json({
                errors: {
                    email: "Please make sure you are using correct url.",
                },
            });
        }
        if (!user.token_send_at) {
            return res.status(422).json({
                errors: {
                    email: "Token was not sended",
                },
            });
        }
        const hoursDiff = checkDateHourDifference(user.token_send_at);
        if (hoursDiff > 2) {
            return res.status(422).json({
                errors: {
                    email: "Password Reset token got expire.please send new token to reset password.",
                },
            });
        }
        // * Update the password
        const salt = await bcrypt.genSalt(10);
        const newPass = await bcrypt.hash(payload.password, salt);
        await prisma.user.update({
            data: {
                password: newPass,
                password_reset_token: null,
                token_send_at: null,
            },
            where: { email: payload.email },
        });
        return res.json({
            message: "Password reset successfully! please try to login now.",
        });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            logger.error({ type: "Auth Error", body: error });
            return res.status(500).json({
                error: "Something went wrong.please try again!",
                data: error,
            });
        }
    }
});
// router.get("/user", authMiddleware, async (req: Request, res: Response) => {
//   const user = req.user;
//   await testQueue.add(testQueueName, user);
//   return res.json({ message: "Fetched", user });
// });
export default router;
