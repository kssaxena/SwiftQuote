import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";

const allowedOrigins = [process.env.ORIGIN_1];

const app = express();

// const server = http.createServer(app);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "32kb" })); // For JSON format
app.use(express.text({ type: "text/*", limit: "32kb" })); // For plain text format
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//print function to ensure every step is executed
app.use((req, res, next) => {
  console.log("--------------------------------");
  console.log(`Received:`, req.method);
  console.log(`at:`, req.url);
  console.log(`with body:`, req.body);
  next();
});

// routers
import userRouter from "./routes/user.routes.js";

//vendor routes
app.use("/api/v1/users", userRouter);

export { app };
