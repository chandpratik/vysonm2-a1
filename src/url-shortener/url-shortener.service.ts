import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Url } from './url.entity';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async createShortenedUrl(longUrl: string): Promise<string> {
    const shortCode = this.generateHashedShortCode(longUrl);

    const url = this.urlRepository.create({ shortCode, longUrl });
    await this.urlRepository.save(url);

    return shortCode;
  }

  async getOriginalUrl(shortCode: string): Promise<string | null> {
    const url = await this.urlRepository.findOne({ where: { shortCode } });
    return url ? url.longUrl : null;
  }

  private generateHashedShortCode(longUrl: string): string {
    const hash = crypto.createHash('sha256').update(longUrl).digest('base64');
    // Advantage: Hashing ensures that the same long URL always maps to the same short code, avoiding duplication.
    return hash.replace(/[^a-zA-Z0-9]/g, '').slice(2, 8);
  }
}
