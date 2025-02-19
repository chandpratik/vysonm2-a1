import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UrlShortenerService {
  private urlMap = new Map<string, string>(); // Stores code -> URL mapping

  generateShortCode(url: string): string {
    const code = Math.random().toString(36).substr(2, 8); // Generate random 8-char code
    this.urlMap.set(code, url);
    return code;
  }

  getOriginalUrl(code: string): string {
    const url = this.urlMap.get(code);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return url;
  }
}
