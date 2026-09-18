import { Test, TestingModule } from '@nestjs/testing';
import { Book } from './book.entity.js';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';

describe('BooksController', () => {
  let controller: BooksController;
  const booksService = {
    create: vi.fn(),
    findAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: booksService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass create data to the service', async () => {
    const createBookDto = {
      title: 'NestJS 入门',
      author: '示例作者',
    };
    const book = { id: 1, ...createBookDto } as Book;

    booksService.create.mockResolvedValue(book);

    await expect(controller.create(createBookDto)).resolves.toBe(book);
    expect(booksService.create).toHaveBeenCalledWith(createBookDto);
  });

  it('should return all books from the service', async () => {
    const books = [
      { id: 1, title: '西游记', author: '吴承恩' },
      { id: 2, title: '红楼梦', author: '曹雪芹' },
    ] as Book[];

    booksService.findAll.mockResolvedValue(books);

    await expect(controller.findAll()).resolves.toBe(books);
    expect(booksService.findAll).toHaveBeenCalledOnce();
  });
});
