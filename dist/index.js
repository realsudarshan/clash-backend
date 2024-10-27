import express from "express";
import "dotenv/config";
import path from 'path';
import { fileURLToPath } from "url";
import ejs from 'ejs';
import router from "./routes/index.js";
import cors from 'cors';
import { applimiter } from "./config/rateLimit.js";
const _dirname = path.dirname(fileURLToPath(import.meta.url));
import fileUpload from 'express-fileupload';
const app = express();
const PORT = process.env.PORT || 7000;
app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(applimiter);
//set view engine
app.set("view engine", "ejs");
app.set("views", path.resolve(_dirname, "./views"));
app.use("/", router);
app.get("/", async (req, res) => {
    const html = await ejs.renderFile(_dirname + '/views/emails/welcome.ejs', { name: "Sudarshan Dhakal" });
    res.render("emails/welcome", { name: "Sudarshan DHakal" });
});
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
