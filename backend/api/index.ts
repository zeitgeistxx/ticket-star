import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

// One Express instance per container, reused across warm invocations.
const server = express();

// Nest is bootstrapped once per container rather than once per request.
let bootstrapped: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn', 'log'],
  });

  const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;

  app.enableCors({
    // Reflect the caller's origin when no allowlist is configured. `*` cannot be
    // combined with credentialed requests, so browsers would reject it.
    origin: corsOrigin
      ? corsOrigin.includes(',')
        ? corsOrigin.split(',').map((o) => o.trim())
        : corsOrigin
      : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Must mirror src/main.ts so routes resolve identically on Vercel and locally.
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.init();
}

export default async function handler(req: express.Request, res: express.Response) {
  if (!bootstrapped) {
    bootstrapped = bootstrap().catch((err) => {
      // Don't cache a failed bootstrap — let the next invocation retry.
      bootstrapped = null;
      throw err;
    });
  }

  await bootstrapped;
  server(req, res);
}
