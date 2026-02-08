import express from "express";
import cors from "cors";
import router from "./routes";
import { globalErrorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(globalErrorHandler);

export default app;
