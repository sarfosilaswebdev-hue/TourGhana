import express from "express";
import cors from "cors";
import routers from "./routes/index";
import dotenv from "dotenv";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();



const app = express();
// 🔹 Logging middleware (put early)

app.use(clerkMiddleware());
app.use(morgan("dev"));

app.use(cors());
app.use(express.json());



app.use('/api',routers)

export default app;