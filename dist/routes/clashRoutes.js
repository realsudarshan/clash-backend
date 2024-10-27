import { Router } from 'express';
import { ZodError } from 'zod';
import { formatError, imageValidator, uploadImage } from '../helper.js';
import logger from '../config/logger.js';
import { clashSchema } from '../validation/clashValidation.js';
import { prisma } from '../config/database.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = Router();
router.get("/", authMiddleware, async (req, res) => {
    try {
        const clashs = await prisma.clash.findMany({
            where: { user_id: req.user?.id },
        });
        return res.json({ message: "Data Fetched", data: clashs });
    }
    catch (error) {
        logger.error({ type: "Clash Post Error", body: error });
        return res
            .status(500)
            .json({ error: "Something went wrong.please try again!", data: error });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const clash = await prisma.clash.findUnique({
            where: { id: Number(id) },
            // include: {
            //   ClashItem: {
            //     select: {
            //       image: true,
            //       id: true,
            //       count: true,
            //     },
            //   },
            //   ClashComments: {
            //     select: {
            //       id: true,
            //       comment: true,
            //       created_at: true,
            //     },
            //     orderBy: {
            //       id: "desc",
            //     },
            //   },
            // },
        });
        return res.json({ message: "Data Fetched", data: clash });
    }
    catch (error) {
        logger.error({ type: "Clash get Error", body: error });
        res
            .status(500)
            .json({ error: "Something went wrong.please try again!", data: error });
    }
});
router.post("/", authMiddleware, async (req, res) => {
    try {
        const body = req.body;
        const payload = clashSchema.parse(body);
        // * Check if file exists
        if (req.files?.image) {
            const image = req.files.image;
            const validMsg = imageValidator(image?.size, image?.mimetype);
            if (validMsg) {
                return res.status(422).json({ errors: { image: validMsg } });
            }
            payload.image = uploadImage(image);
        }
        else {
            return res
                .status(422)
                .json({ errors: { image: "Image field is required." } });
        }
        await prisma.clash.create({
            data: {
                title: payload.title,
                description: payload.description,
                image: payload?.image,
                user_id: req.user?.id,
                expire_at: new Date(payload.expire_at)
            },
        });
        return res.json({ message: "Clash created successfully!" });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid data", errors });
        }
        else {
            logger.error({ type: "Clash Post Error", body: error });
            res
                .status(500)
                .json({ error: "Something went wrong.please try again!", data: error });
        }
    }
});
export default router;
