import { Job, Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/queue.js";
import { Sendmail } from "../config/mail.js";

export const emailQueueName = "emailQueue";

export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueueConfig,
});
console.log("The emal queue is",emailQueue)
// * Workers
export const handler = new Worker(
  emailQueueName,
  async (job: Job) => {
 const data=job.data;
 await Sendmail(data.to,data.subject,data.body)
   
  
  },
  { connection: redisConnection }
);
handler.on("completed", (job: Job) => {
    console.log(`Job ${job.id} completed successfully`);
  });
  
  handler.on("failed", (job: Job|undefined, err) => {
if(job)
    console.error(`Job ${job.id} failed with error: ${err.message}`);


  });