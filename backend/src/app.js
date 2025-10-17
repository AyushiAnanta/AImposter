import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//configuratios!!!!!!!!!!!!!!!!!!1
app.use(express.json({limit: "4kb"}))
app.use(express.urlencoded({extended: true, limit: "4kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import gameRoutes from "./routes/gameRoutes.js";

app.use("/api/v1", gameRoutes);

export {app};