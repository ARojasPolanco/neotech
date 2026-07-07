import express from "express";
import cors from "cors";
import { router } from "./routes/routes.js";
import { globalErrorHandler } from "./errors/error.controller.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

app.use(globalErrorHandler);

export default app;
