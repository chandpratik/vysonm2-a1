import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { Response } from 'express';

@Controller('url-shortener')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Post('shorten')
  shortenUrl(@Body('url') url: string) {
    const code = this.urlShortenerService.generateShortCode(url);
    return {
      shortCode: code,
    };
  }

  @Get('redirect')
  redirectToOriginalUrl(@Query('code') code: string, @Res() res: Response) {
    try {
      const originalUrl = this.urlShortenerService.getOriginalUrl(code);
      return res.redirect(originalUrl);
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).send({ error: error.message });
    }
  }
}
