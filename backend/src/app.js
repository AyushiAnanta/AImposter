import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin.includes("vercel.app") ||
      origin.includes("localhost")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

//configuratios!!!!!!!!!!!!!!!!!!1
app.use(express.json({limit: "4kb"}))
app.use(express.urlencoded({extended: true, limit: "4kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.options("*", cors());

import gameRoutes from "./routes/gameRoutes.js";

app.use("/api/v1", gameRoutes);

export {app};