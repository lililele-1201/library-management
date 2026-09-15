import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  author: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  isbn?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  publishedYear?: number | null;
}
