import { Test, TestingModule } from '@nestjs/testing';
import { UrlShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from './url-shortener.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from './url.entity';
import { Repository } from 'typeorm';
import { Response } from 'express';

describe('UrlShortenerController Integration', () => {
  let controller: UrlShortenerController;
  let service: UrlShortenerService;
  let repository: Repository<Url>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlShortenerController],
      providers: [
        UrlShortenerService,
        {
          provide: getRepositoryToken(Url),
          useClass: Repository, // Use TypeORM's Repository class
        },
      ],
    }).compile();

    controller = module.get<UrlShortenerController>(UrlShortenerController);
    service = module.get<UrlShortenerService>(UrlShortenerService);
    repository = module.get<Repository<Url>>(getRepositoryToken(Url));
  });

  it('should shorten and redirect a URL successfully', async () => {
    const longUrl = 'https://example.com';
    const shortCode = 'aArVRs';

    // Simulating repository behavior
    jest
      .spyOn(repository, 'create')
      .mockReturnValue({ shortCode, longUrl } as Url);
    jest
      .spyOn(repository, 'save')
      .mockResolvedValue({ shortCode, longUrl } as Url);
    jest
      .spyOn(repository, 'findOne')
      .mockResolvedValue({ shortCode, longUrl } as Url);

    // Test shortening the URL
    const result = await controller.shortenUrl({ longUrl });
    expect(result.shortCode).toEqual(shortCode);

    // Mock the response object
    const res = {
      redirect: jest.fn(),
    } as unknown as Response;

    // Test redirection
    await controller.redirectUrl(shortCode, res);
    expect(res.redirect).toHaveBeenCalledWith(longUrl);
  });

  it('should throw an exception for an invalid short code', async () => {
    const invalidCode = 'INVALID_CODE';

    // Simulate repository behavior for invalid code
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    const res = {
      redirect: jest.fn(),
    } as unknown as Response;

    await expect(controller.redirectUrl(invalidCode, res)).rejects.toThrow(
      'Short URL not found',
    );
  });
});
