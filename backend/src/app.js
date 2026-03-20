import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ Define CORS options ONCE
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
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
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests properly
app.options("*", cors(corsOptions));

// ✅ Body parsers
app.use(express.json({ limit: "4kb" }));
app.use(express.urlencoded({ extended: true, limit: "4kb" }));

// ✅ Static files
app.use(express.static("public"));

// ✅ Cookies
app.use(cookieParser());

// ✅ Routes
import gameRoutes from "./routes/gameRoutes.js";
app.use("/api/v1", gameRoutes);

// (optional) health check route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

export { app };