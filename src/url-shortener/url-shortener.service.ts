import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Url } from './url.entity';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async createShortenedUrl(longUrl: string): Promise<string> {
    // Try to generate a unique short code
    let shortCode = this.generateRandomShortCode();
    let isUnique = false;

    // Keep trying until we find a unique code
    while (!isUnique) {
      const existingUrl = await this.urlRepository.findOne({
        where: { shortCode },
      });

      if (!existingUrl) {
        isUnique = true;
      } else {
        // If collision, generate a new short code
        shortCode = this.generateRandomShortCode();
      }
    }

    return await this.saveUrl(shortCode, longUrl);
  }

  async getOriginalUrl(shortCode: string): Promise<string | null> {
    const url = await this.urlRepository.findOne({ where: { shortCode } });

    if (!url) return null;

    // Increment click count and update last_accessed_at
    await this.urlRepository.update(
      { shortCode },
      { click_count: url.click_count + 1, last_accessed_at: new Date() },
    );

    return url.longUrl;
  }

  async deleteShortenedUrl(shortCode: string): Promise<DeleteResult> {
    return await this.urlRepository.delete({
      shortCode,
    });
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

  private generateRandomShortCode(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      shortCode += characters.charAt(randomIndex);
    }

    return shortCode;
  }
}
