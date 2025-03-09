import  express  from 'express'
import dotenv from "dotenv";
import "./src/utils/Cron/cronJob.js";
import { bootstrab } from './src/app.controller.js';
import { setupSocket } from './src/utils/Socket/soket.js';
dotenv.config({path:"./src/config/.env"});
const app = express()



await bootstrab(app,express);
const port = process.env.PORT || 5000;
const server=app.listen(port, () => console.log(`Example app listening on port ${port}!`))

export const io = setupSocket(server);
