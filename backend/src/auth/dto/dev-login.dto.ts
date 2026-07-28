import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class DevLoginDto {
  @IsString() @MinLength(1) unionId!: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
}
