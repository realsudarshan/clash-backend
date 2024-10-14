import { ZodError } from "zod";
import { v4 as uuidv4 } from "uuid"; 
import path from 'path';
import {fileURLToPath} from 'node:url';
import { renderFile } from "ejs";
import moment from "moment";

export const formatError=(error:ZodError):any=>{
    let errors:any={};
    error.errors?.map((issue)=>{
        errors[issue.path?.[0]]=issue.message;
    });
return errors;
    }
    export const generateRandomNum = () => {
        return uuidv4();
      };
      export const renderEmailEjs=async (filename:string,payload:any)=>{
        const _dirname=path.dirname(fileURLToPath(import.meta.url));
        console.log(_dirname)
        const html=await renderFile(_dirname+`/views/emails/${filename}.ejs`,payload);
        return html;
      }
      export const checkDateHourDifference = (date: Date | string): number => {
        const now = moment();
        const tokenSentAt = moment(date);
        const difference = moment.duration(now.diff(tokenSentAt));
        const hoursDiff = difference.asHours();
        return hoursDiff;
      };

      

