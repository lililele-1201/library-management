import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBookDto } from './create-book.dto.js';

async function getInvalidProperties(input: Record<string, unknown>) {
  const dto = plainToInstance(CreateBookDto, input);
  const errors = await validate(dto);

  return errors.map((error) => error.property);
}

describe('CreateBookDto', () => {
  it('should accept valid book data', async () => {
    const invalidProperties = await getInvalidProperties({
      title: 'NestJS 入门',
      author: '示例作者',
      isbn: '978-7-0000-0000-1',
      publishedYear: 2026,
    });

    expect(invalidProperties).toEqual([]);
  });

  it('should accept omitted optional fields', async () => {
    const invalidProperties = await getInvalidProperties({
      title: 'NestJS 入门',
      author: '示例作者',
    });

    expect(invalidProperties).toEqual([]);
  });

  it('should accept null optional fields', async () => {
    const invalidProperties = await getInvalidProperties({
      title: 'NestJS 入门',
      author: '示例作者',
      isbn: null,
      publishedYear: null,
    });

    expect(invalidProperties).toEqual([]);
  });

  it('should reject missing title and author', async () => {
    const invalidProperties = await getInvalidProperties({});

    expect(invalidProperties).toEqual(
      expect.arrayContaining(['title', 'author']),
    );
  });

  it('should reject empty required fields and an empty ISBN', async () => {
    const invalidProperties = await getInvalidProperties({
      title: '',
      author: '',
      isbn: '',
    });

    expect(invalidProperties).toEqual(
      expect.arrayContaining(['title', 'author', 'isbn']),
    );
  });

  it('should reject text fields that exceed their maximum length', async () => {
    const invalidProperties = await getInvalidProperties({
      title: '书'.repeat(201),
      author: '作者'.repeat(51),
      isbn: '1'.repeat(21),
    });

    expect(invalidProperties).toEqual(
      expect.arrayContaining(['title', 'author', 'isbn']),
    );
  });

  it.each([-1, 10000, 2026.5, '2026'])(
    'should reject invalid publishedYear: %s',
    async (publishedYear) => {
      const invalidProperties = await getInvalidProperties({
        title: 'NestJS 入门',
        author: '示例作者',
        publishedYear,
      });

      expect(invalidProperties).toContain('publishedYear');
    },
  );
});
