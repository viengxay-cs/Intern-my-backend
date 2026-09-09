import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsHandler');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1. Errors NestJS already understands (NotFoundException,
    //    BadRequestException, ForbiddenException, ValidationPipe
    //    errors, ...) — just pass them through unchanged.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(
        typeof body === 'string' ? { statusCode: status, message: body } : body,
      );
      return;
    }

    // 2. Mongoose validation errors (e.g. a required schema field is
    //    missing) — turn each field's complaint into a readable list
    //    instead of one giant stack-trace-shaped object.
    if (exception instanceof MongooseError.ValidationError) {
      const messages = Object.values(exception.errors).map((err) => err.message);
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: messages,
      });
      return;
    }

    // 3. Mongoose cast errors — usually an invalid ObjectId was passed
    //    in a URL param, e.g. GET /products/not-a-real-id
    if (exception instanceof MongooseError.CastError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: `Invalid ${exception.path}: "${exception.value}"`,
      });
      return;
    }

    // 4. MongoDB duplicate key errors (unique index violation), e.g.
    //    creating a Category with a name that already exists.
    if (this.isDuplicateKeyError(exception)) {
      const field = Object.keys((exception as any).keyValue ?? {})[0] ?? 'field';
      const value = (exception as any).keyValue?.[field];
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: `${field} "${value}" is already in use`,
      });
      return;
    }

    // 5. Anything else is a genuine, unexpected bug. Log the full
    //    error server-side (so it still shows up in the terminal/Render
    //    logs for debugging) but never leak internals to the client.
    this.logger.error(
      exception instanceof Error ? exception.stack : exception,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again.',
    });
  }

  private isDuplicateKeyError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as any).code === 11000
    );
  }
}