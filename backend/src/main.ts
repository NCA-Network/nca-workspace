import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes live under /api (matches the frontend Vite proxy + prod base URL).
  app.setGlobalPrefix("api");
  app.use(cookieParser());

  // The frontend is a separate origin, so it needs credentialed CORS.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = parseInt(process.env.PORT || "8787", 10);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${port}/api`);
}

void bootstrap();
