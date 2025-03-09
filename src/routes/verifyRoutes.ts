import { Router, Request, Response } from "express";
import {prisma} from "../config/database.js";

const router = Router();

// * Verify email
router.get("/verify/email", async (req: Request, res: Response) => {
  const { email, token } = req.query;
  if (email && token) {
    const user = await prisma.user.findUnique({
      select: {
        email_verify_token: true,
        id: true,
      },
      where: { email: email as string },
    });
    console.log(user);
    if (user) {
      // * Check both token
      if (token !== user.email_verify_token) {
        return res.redirect("/verify/error");
      }
      await prisma.user.update({
        data: {
          email_verified_at: new Date().toISOString(),
          email_verify_token: undefined,
        },
        where: {
          id: user.id,
        },
      });
      return res.redirect(`http://localhost:7000/login`);
    }
    return res.redirect("/verify/error");
  }
});

// * Verify error page
router.get("/verify/error", (req: Request, res: Response) => {
  return res.render("auth/verifyEmailError");
});

export default router;