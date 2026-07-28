import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class CreateProductDto {
  // businessId is derived from the authenticated user's business, server-side.
  // Kept optional for backward compatibility; the value is ignored.
  @IsOptional() @IsInt() businessId?: number;

  @IsString() @Length(1, 255) name!: string;

  @IsOptional() @IsString() description?: string;

  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: "price must be a decimal string like '12' or '12.50'",
  })
  price!: string;

  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsBoolean() availability?: boolean;
  @IsOptional() @IsInt() stockQuantity?: number;
}
