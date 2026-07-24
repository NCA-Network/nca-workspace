import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class UpdateBusinessDto {
  @IsOptional() @IsString() @Length(1, 255) businessName?: string;
  @IsOptional() @IsString() whatsappNumber?: string;
  @IsOptional() @IsString() businessHours?: string;
  @IsOptional() @IsString() deliveryInfo?: string;
  @IsOptional() @IsString() paymentMethods?: string;
  @IsOptional() @IsBoolean() aiEnabled?: boolean;
}
