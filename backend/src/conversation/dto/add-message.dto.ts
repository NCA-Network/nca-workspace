import { IsIn, IsString, MinLength } from "class-validator";

export class AddMessageDto {
  @IsIn(["customer", "ai", "human"])
  sender!: "customer" | "ai" | "human";

  @IsString() @MinLength(1) content!: string;
}
