import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Parse Cookie header and populate req.cookies
  app.use(cookieParser());

  // Enable CORS - restrict to known origins in production
  const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const allowedOrigins = Array.from(
    new Set([
      'http://localhost:3000',
      'http://localhost:19006', // Expo web
      ...configuredOrigins,
    ]),
  );

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    logger.warn(
      '⚠️ [CORS] Development mode active: CORS is in permissive mode. Set NODE_ENV=production in production.',
    );
  } else {
    logger.log(`🔒 [CORS] Production mode active: Allowed origins: ${allowedOrigins.join(', ')}`);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Mobile Apps via React Native / Expo, curl, Postman)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      if (!isProduction) {
        return callback(null, true);
      }

      logger.warn(`🛑 [CORS Blocked] Unauthorized origin attempted connection: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Cookie,X-Requested-With,Accept',
  });

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true, // Reject requests with unknown fields
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Setup Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Campus Food Ordering API')
    .setDescription('REST API & WebSocket Gateway for Campus Food Ordering System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Server is running on: http://localhost:${port}/api (and LAN 0.0.0.0:${port})`);
  logger.log(`📚 Swagger API Docs available at: http://localhost:${port}/api/docs`);
  logger.log(`⚡ WebSocket Server listening on port: ${port}`);

}

bootstrap();
