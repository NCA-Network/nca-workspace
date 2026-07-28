import { IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class CreateFaqDto {
  // Derived from the authenticated user's business server-side; value ignored.
  @IsOptional() @IsInt() businessId?: number;
  @IsString() @MinLength(1) question!: string;
  @IsString() @MinLength(1) answer!: string;
  @IsOptional() @IsString() category?: string;
}
