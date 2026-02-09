import express from "express";
import cors from "cors";
import router from "./routes";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { swaggerSpec, swaggerUi } from "./docs/swagger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Stock Control - API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "list",
      filter: true,
      tryItOutEnabled: true,
    },
  }),
);

app.use("/api", router);

app.use(globalErrorHandler);

export default app;
