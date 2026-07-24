import { IsInt, IsOptional, IsString } from "class-validator";

export class RequestHandoffDto {
  @IsInt() conversationId!: number;
  @IsOptional() @IsString() reason?: string;
}
