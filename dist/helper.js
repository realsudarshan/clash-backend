import { v4 as uuidv4 } from "uuid";
import path from 'path';
import { fileURLToPath } from 'node:url';
import { renderFile } from "ejs";
import moment from "moment";
import { supportedMimes } from "./config/filesystem.js";
export const formatError = (error) => {
    let errors = {};
    error.errors?.map((issue) => {
        errors[issue.path?.[0]] = issue.message;
    });
    return errors;
};
export const generateRandomNum = () => {
    return uuidv4();
};
export const renderEmailEjs = async (filename, payload) => {
    const _dirname = path.dirname(fileURLToPath(import.meta.url));
    console.log(_dirname);
    const html = await renderFile(_dirname + `/views/emails/${filename}.ejs`, payload);
    console.log(html);
    return html;
};
export const checkDateHourDifference = (date) => {
    const now = moment();
    const tokenSentAt = moment(date);
    const difference = moment.duration(now.diff(tokenSentAt));
    const hoursDiff = difference.asHours();
    return hoursDiff;
};
export const imageValidator = (size, mime) => {
    if (bytesToMb(size) > 2) {
        return "Image size must be less than 2 MB";
    }
    else if (!supportedMimes.includes(mime)) {
        return "Image must be type of png,jpg,jpeg,svg,webp,gif..";
    }
    return null;
};
export const bytesToMb = (bytes) => {
    return bytes / (1024 * 1024);
};
export const uploadImage = (image) => {
    const imgExt = image?.name.split(".");
    const imageName = generateRandomNum() + "." + imgExt[1];
    const uploadPath = process.cwd() + "/public/images/" + imageName;
    image.mv(uploadPath, (err) => {
        if (err)
            throw err;
    });
    return imageName;
};
