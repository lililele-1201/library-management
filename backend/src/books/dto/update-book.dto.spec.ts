import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateBookDto } from './update-book.dto.js';

async function getInvalidProperties(input: Record<string, unknown>) {
  const dto = plainToInstance(UpdateBookDto, input);
  const errors = await validate(dto);

  return errors.map((error) => error.property);
}

describe('UpdateBookDto', () => {
  it('should accept an empty partial update', async () => {
    const invalidProperties = await getInvalidProperties({});

    expect(invalidProperties).toEqual([]);
  });

  it('should accept one valid field', async () => {
    const invalidProperties = await getInvalidProperties({
      title: 'NestJS 进阶',
    });

    expect(invalidProperties).toEqual([]);
  });

  it('should keep the original text validation rules', async () => {
    const invalidProperties = await getInvalidProperties({
      title: '',
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
      const invalidProperties = await getInvalidProperties({ publishedYear });

      expect(invalidProperties).toContain('publishedYear');
    },
  );
});
