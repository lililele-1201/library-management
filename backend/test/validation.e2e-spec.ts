import {
  Body,
  Controller,
  Get,
  INestApplication,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty, IsString } from 'class-validator';
import request from 'supertest';
import { App } from 'supertest/types';

class ValidationExampleDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

@Controller('validation-example')
class ValidationExampleController {
  @Post()
  create(@Body() dto: ValidationExampleDto) {
    return dto;
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return { id, type: typeof id };
  }
}

describe('ValidationPipe (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ValidationExampleController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('should reject a body with an invalid field type', () => {
    return request(app.getHttpServer())
      .post('/validation-example')
      .send({ title: 123 })
      .expect(400);
  });

  it('should reject a body with an unknown field', () => {
    return request(app.getHttpServer())
      .post('/validation-example')
      .send({ title: 'NestJS 入门', extra: '不允许的字段' })
      .expect(400);
  });

  it('should transform a numeric path parameter', () => {
    return request(app.getHttpServer())
      .get('/validation-example/42')
      .expect(200)
      .expect({ id: 42, type: 'number' });
  });

  afterEach(async () => {
    await app.close();
  });
});
