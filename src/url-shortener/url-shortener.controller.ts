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
  Delete,
  Param,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { CreateUrlDto, CreateUrlSchema } from './dto/create-url.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { Response } from 'express';
import { DeleteResult } from 'typeorm';

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
    };
  }

  @Delete(':shortCode')
  async deleteUrl(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const deleteResult: DeleteResult =
      await this.urlShortenerService.deleteShortenedUrl(shortCode);

    if (deleteResult.affected === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    return res.status(200).json({ message: 'Short URL deleted successfully' });
  }

  @Get('redirect')
  async redirectUrl(@Query('code') code: string, @Res() res: Response) {
    const originalUrl = await this.urlShortenerService.getOriginalUrl(code);

    if (!originalUrl) {
      throw new HttpException('Short URL not found', HttpStatus.NOT_FOUND);
    }

    res.redirect(HttpStatus.FOUND, originalUrl);
  }
}
