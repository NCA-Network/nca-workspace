import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
} from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { BusinessService } from "../business/business.service";
import { AiService } from "../ai/ai.service";
import type { Business } from "@prisma/client";
import { WhatsappInboundDto } from "./dto/whatsapp-inbound.dto";

/**
 * Inbound WhatsApp ingress. A real provider (Meta Cloud API / Twilio) POSTs
 * customer messages here; we resolve the business, run the shared AI pipeline
 * (respecting the business's aiEnabled flag), and return the generated reply.
 *
 * NOTE: outbound delivery back to the customer requires provider credentials
 * and is left as a documented stub below. Signature verification is also TODO.
 */
@Public()
@Controller("webhooks")
export class WebhookController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly aiService: AiService,
  ) {}

  /** Provider verification handshake (echoes the challenge). */
  @Get("whatsapp")
  verify(
    @Query("hub.challenge") challenge?: string,
    @Query("hub.verify_token") token?: string,
  ) {
    const expected = process.env.WHATSAPP_VERIFY_TOKEN;
    if (expected && token === expected && challenge) {
      return challenge;
    }
    return { ok: true };
  }

  @Post("whatsapp")
  async inbound(@Body() dto: WhatsappInboundDto) {
    let business: Business | null = null;
    if (dto.businessId) {
      business = await this.businessService.getById(dto.businessId);
    } else if (dto.businessWhatsapp) {
      business = await this.businessService.findByWhatsappNumber(dto.businessWhatsapp);
    } else {
      throw new BadRequestException(
        "Provide businessId or businessWhatsapp to route the message.",
      );
    }

    if (!business) throw new NotFoundException("Business not found");

    const result = await this.aiService.converse(business, {
      customerPhone: dto.from,
      customerName: dto.name,
      message: dto.message,
      autoReply: business.aiEnabled,
    });

    // TODO(provider): if result.response is set, send it back to dto.from via
    // the WhatsApp Cloud API / Twilio here. Requires provider credentials.
    return {
      conversationId: result.conversationId,
      reply: result.response,
      delivered: false,
      aiEnabled: business.aiEnabled,
    };
  }
}
