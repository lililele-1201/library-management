import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { Book } from '../src/books/book.entity.js';
import { BooksModule } from '../src/books/books.module.js';

describe('Create book (e2e)', () => {
  let app: INestApplication<App>;
  let bookRepository: Repository<Book>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        BooksModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    bookRepository = moduleFixture.get<Repository<Book>>(
      getRepositoryToken(Book),
    );
  });

  it('POST /api/books should save and return a book', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/books')
      .send({
        title: 'NestJS 入门',
        author: '示例作者',
        isbn: '978-7-0000-0000-1',
        publishedYear: 2026,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      title: 'NestJS 入门',
      author: '示例作者',
      isbn: '978-7-0000-0000-1',
      publishedYear: 2026,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    const savedBook = await bookRepository.findOneBy({ id: response.body.id });

    expect(savedBook).toMatchObject({
      title: 'NestJS 入门',
      author: '示例作者',
    });
  });

  it('POST /api/books should reject invalid data', async () => {
    await request(app.getHttpServer())
      .post('/api/books')
      .send({ title: '' })
      .expect(400);

    await expect(bookRepository.count()).resolves.toBe(0);
  });

  afterEach(async () => {
    await app.close();
  });
});
