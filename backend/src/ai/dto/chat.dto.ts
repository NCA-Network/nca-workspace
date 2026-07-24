import { IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class ChatDto {
  @IsString() @MinLength(1) message!: string;
  @IsOptional() @IsInt() conversationId?: number;
  @IsOptional() @IsString() customerPhone?: string;
  @IsOptional() @IsString() customerName?: string;
}
