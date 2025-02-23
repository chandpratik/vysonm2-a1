import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid'; // UUID for fallback
import { Url } from './url.entity';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async createShortenedUrl(longUrl: string): Promise<string> {
    // Check if the URL already exists in the database
    const existingUrl = await this.urlRepository.findOne({
      where: { longUrl },
    });
    if (existingUrl) {
      return existingUrl.shortCode;
    }

    // Generate a new short code if the URL does not exist
    let attempt = 0;
    let shortCode = this.generateShortCode(longUrl, attempt);

    while (attempt < 3) {
      const existingShortCode = await this.urlRepository.findOne({
        where: { shortCode },
      });

      if (!existingShortCode) {
        return await this.saveUrl(shortCode, longUrl);
      }

      // If collision, generate a new short code
      attempt++;
      shortCode = this.generateShortCode(longUrl, attempt);
    }

    // Final fallback: Use a UUID-based short code to guarantee uniqueness
    shortCode = this.generateUuidShortCode();
    return await this.saveUrl(shortCode, longUrl);
  }

  async getOriginalUrl(shortCode: string): Promise<string | null> {
    const url = await this.urlRepository.findOne({ where: { shortCode } });
    return url ? url.longUrl : null;
  }

  private async saveUrl(shortCode: string, longUrl: string): Promise<string> {
    const url = this.urlRepository.create({ shortCode, longUrl });

    try {
      await this.urlRepository.save(url);
      return shortCode;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database error while saving short URL',
      );
    }
  }

  private generateShortCode(longUrl: string, attempt: number): string {
    const hash = crypto
      .createHash('md5')
      .update(longUrl + attempt)
      .digest('base64');
    return hash.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6); // Use first 6 alphanumeric characters
  }

  private generateUuidShortCode(): string {
    return uuidv4().replace(/-/g, '').slice(0, 6); // Compact UUID to avoid conflicts
  }
}
