import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Res,
  HttpException,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { CreateUrlDto, CreateUrlSchema } from './dto/create-url.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { Response } from 'express';

@Controller()
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Post('shorten')
  @UsePipes(new ZodValidationPipe(CreateUrlSchema))
  async shortenUrl(@Body() createUrlDto: CreateUrlDto) {
    const { longUrl } = createUrlDto;
    const shortCode =
      await this.urlShortenerService.createShortenedUrl(longUrl);
    return {
      shortCode,
      // shortUrl: `http://localhost:3000/redirect?code=${shortCode}`,
    };
  }

  @Get('redirect')
  async redirectUrl(@Query('code') code: string, @Res() res: Response) {
    const originalUrl = await this.urlShortenerService.getOriginalUrl(code);

    if (!originalUrl) {
      throw new HttpException('Short URL not found', HttpStatus.NOT_FOUND);
    }

    return res.redirect(originalUrl);
  }
}
