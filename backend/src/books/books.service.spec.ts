import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './book.entity.js';
import { BooksService } from './books.service.js';

describe('BooksService', () => {
  let service: BooksService;
  const bookRepository = {
    create: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: bookRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and save a book', async () => {
    const createBookDto = {
      title: 'NestJS 入门',
      author: '示例作者',
    };
    const book = {
      id: 1,
      ...createBookDto,
      isbn: null,
      publishedYear: null,
    } as Book;

    bookRepository.create.mockReturnValue(book);
    bookRepository.save.mockResolvedValue(book);

    await expect(service.create(createBookDto)).resolves.toBe(book);
    expect(bookRepository.create).toHaveBeenCalledWith({
      ...createBookDto,
      isbn: null,
      publishedYear: null,
    });
    expect(bookRepository.save).toHaveBeenCalledWith(book);
  });
});
