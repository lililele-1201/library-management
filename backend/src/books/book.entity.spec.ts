import { DataSource } from 'typeorm';
import { Book } from './book.entity.js';

describe('Book entity', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [Book],
      synchronize: true,
    });

    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should create the book table with the planned columns', async () => {
    const columns = (await dataSource.query(
      'PRAGMA table_info("book")',
    )) as Array<{ name: string }>;

    expect(columns.map((column) => column.name)).toEqual([
      'id',
      'title',
      'author',
      'isbn',
      'publishedYear',
      'createdAt',
      'updatedAt',
    ]);
  });

  it('should define the planned column rules', () => {
    const metadata = dataSource.getMetadata(Book);
    const id = metadata.findColumnWithPropertyName('id');
    const title = metadata.findColumnWithPropertyName('title');
    const author = metadata.findColumnWithPropertyName('author');
    const isbn = metadata.findColumnWithPropertyName('isbn');
    const publishedYear = metadata.findColumnWithPropertyName('publishedYear');
    const createdAt = metadata.findColumnWithPropertyName('createdAt');
    const updatedAt = metadata.findColumnWithPropertyName('updatedAt');

    expect(metadata.tableName).toBe('book');
    expect(id).toMatchObject({
      isGenerated: true,
      isPrimary: true,
      generationStrategy: 'increment',
    });
    expect(title).toMatchObject({ isNullable: false, length: '200' });
    expect(author).toMatchObject({ isNullable: false, length: '100' });
    expect(isbn).toMatchObject({ isNullable: true, length: '20' });
    expect(publishedYear).toMatchObject({ isNullable: true, type: 'integer' });
    expect(createdAt?.isCreateDate).toBe(true);
    expect(updatedAt?.isUpdateDate).toBe(true);
    expect(
      metadata.uniques.some((unique) =>
        unique.columns.some((column) => column.propertyName === 'isbn'),
      ),
    ).toBe(true);
  });
});
