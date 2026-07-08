import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      referrerPolicy: { policy: 'same-origin' },
      frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    }),
  );

  // CORS with strict origin validation
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [process.env.NEXT_PUBLIC_APP_URL || 'https://aurorax.example.com']
        : true, // Allow all in dev (or match dev NextJS url)
    credentials: true,
  });

  // Cookie parser for refresh token cookies
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API is running on: http://localhost:${port}`);
}
void bootstrap();
