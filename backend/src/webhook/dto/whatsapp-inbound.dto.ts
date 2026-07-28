import { IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class WhatsappInboundDto {
  /** Target business — by id, or by the business's WhatsApp number. */
  @IsOptional() @IsInt() businessId?: number;
  @IsOptional() @IsString() businessWhatsapp?: string;

  /** Customer's phone number. */
  @IsString() @MinLength(1) from!: string;
  @IsOptional() @IsString() name?: string;

  @IsString() @MinLength(1) message!: string;
}
