import { Test, TestingModule } from '@nestjs/testing';
import { UrlShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from './url-shortener.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from './url.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Response } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

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
    const longUrl = 'https://www.adobe.com';
    const shortCode = 'Jumqee';

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

    expect(res.redirect).toHaveBeenCalledWith(302, longUrl);
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

  it('should return the same short code for duplicate URLs', async () => {
    const longUrl = 'https://example.com';
    const shortCode = 'aArVRs';

    // Simulating repository returning the same short code for duplicate URLs
    jest
      .spyOn(repository, 'findOne')
      .mockResolvedValue({ shortCode, longUrl } as Url);
    jest
      .spyOn(repository, 'create')
      .mockReturnValue({ shortCode, longUrl } as Url);
    jest
      .spyOn(repository, 'save')
      .mockResolvedValue({ shortCode, longUrl } as Url);

    // First request
    const result1 = await controller.shortenUrl({ longUrl });
    expect(result1.shortCode).toEqual(shortCode);

    // Second request (same URL)
    const result2 = await controller.shortenUrl({ longUrl });
    expect(result2.shortCode).toEqual(shortCode);

    // Ensure that save is NOT called again (URL already exists)
    expect(repository.save).toHaveBeenCalledTimes(0);
  });

  it('should return 404 when short code does not exist', async () => {
    const invalidCode = 'INVALID123';

    jest.spyOn(service, 'getOriginalUrl').mockResolvedValue(null);

    const res = {
      redirect: jest.fn(),
    } as unknown as Response;

    await expect(controller.redirectUrl(invalidCode, res)).rejects.toThrow(
      new HttpException('Short URL not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should delete a short URL successfully', async () => {
    const shortCode = 'abc123';

    jest.spyOn(service, 'deleteShortenedUrl').mockResolvedValue({
      affected: 1,
    } as DeleteResult);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.deleteUrl(shortCode, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Short URL deleted successfully',
    });
  });

  it('should return 400 when an empty URL is sent', async () => {
    const emptyUrl = '';

    jest.spyOn(service, 'createShortenedUrl').mockImplementation(() => {
      throw new HttpException('URL cannot be empty', HttpStatus.BAD_REQUEST);
    });

    await expect(controller.shortenUrl({ longUrl: emptyUrl })).rejects.toThrow(
      new HttpException('URL cannot be empty', HttpStatus.BAD_REQUEST),
    );
  });
});
