import { IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class CreateFaqDto {
  @IsInt() businessId!: number;
  @IsString() @MinLength(1) question!: string;
  @IsString() @MinLength(1) answer!: string;
  @IsOptional() @IsString() category?: string;
}
