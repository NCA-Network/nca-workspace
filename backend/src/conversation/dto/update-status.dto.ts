import { IsIn } from "class-validator";

export class UpdateStatusDto {
  @IsIn(["active", "closed", "handed_off"])
  status!: "active" | "closed" | "handed_off";
}
