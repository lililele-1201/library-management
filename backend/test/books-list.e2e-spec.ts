import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { Book } from '../src/books/book.entity.js';
import { BooksModule } from '../src/books/books.module.js';

describe('List books (e2e)', () => {
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
    await app.init();

    bookRepository = moduleFixture.get<Repository<Book>>(
      getRepositoryToken(Book),
    );
  });

  it('GET /api/books should return an empty array', async () => {
    await request(app.getHttpServer()).get('/api/books').expect(200).expect([]);
  });

  it('GET /api/books should return saved books', async () => {
    await bookRepository.save([
      bookRepository.create({
        title: '西游记',
        author: '吴承恩',
        isbn: null,
        publishedYear: null,
      }),
      bookRepository.create({
        title: '红楼梦',
        author: '曹雪芹',
        isbn: null,
        publishedYear: null,
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get('/api/books')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: '西游记', author: '吴承恩' }),
        expect.objectContaining({ title: '红楼梦', author: '曹雪芹' }),
      ]),
    );
  });

  afterEach(async () => {
    await app.close();
  });
});
