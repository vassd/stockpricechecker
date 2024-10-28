import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { StockService } from './stock.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StockService', () => {
  let stockService: StockService;
  let httpService: HttpService;
  let prismaService: PrismaService;

  beforeEach(() => {
    httpService = new HttpService();
    prismaService = new PrismaService();
    stockService = new StockService(httpService, prismaService);
  });

  describe('getStockInfo', () => {
    it('should return stock info when the API call is successful', async () => {
      const symbol = 'AAPL';
      const mockPrice = 150.0;
      const mockApiResponse: AxiosResponse = {
        data: { c: mockPrice },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockApiResponse));
      jest.spyOn(prismaService.stockPrice, 'create').mockResolvedValue({
        symbol,
        price: mockPrice,
        timestamp: new Date(),
        id: 1,
      });

      const result = await stockService.getStockInfo(symbol);
      expect(result.price).toEqual(mockPrice);
      expect(result.symbol).toEqual(symbol);
    });

    it('should throw a NOT_FOUND exception if the symbol does not exist', async () => {
      const symbol = 'INVALID';
      const mockApiResponse: AxiosResponse = {
        data: { c: null },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockApiResponse));

      await expect(stockService.getStockInfo(symbol)).rejects.toThrow(
        new HttpException(
          `Stock symbol "${symbol}" not found in the external API.`,
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw a TOO_MANY_REQUESTS exception if rate-limited', async () => {
      const symbol = 'AAPL';
      const errorResponse = {
        status: 429,
      };

      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw errorResponse;
      });

      await expect(stockService.getStockInfo(symbol)).rejects.toThrow(
        new HttpException(
          'Too many requests to the external API. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );
    });

    it('should throw INTERNAL_SERVER_ERROR for other API errors', async () => {
      const symbol = 'AAPL';
      const errorResponse = {
        status: 500,
      };

      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw errorResponse;
      });

      await expect(stockService.getStockInfo(symbol)).rejects.toThrow(
        new HttpException(
          'Error fetching stock price. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getMovingAverage', () => {
    it('should return the moving average of the last 10 prices', async () => {
      const symbol = 'AAPL';
      const prices = Array.from({ length: 10 }, (_, i) => ({
        price: 100 + i,
        symbol,
        timestamp: new Date(),
        id: i,
      }));
      jest
        .spyOn(prismaService.stockPrice, 'findMany')
        .mockResolvedValue(prices);

      const result = await stockService.getMovingAverage(symbol);
      expect(result).toEqual(104.5);
    });

    it('should return null if there are fewer than 10 prices', async () => {
      const symbol = 'AAPL';
      const prices = [{ price: 100, symbol, timestamp: new Date(), id: 1 }];
      jest
        .spyOn(prismaService.stockPrice, 'findMany')
        .mockResolvedValue(prices);

      const result = await stockService.getMovingAverage(symbol);
      expect(result).toBeNull();
    });

    it('should throw an INTERNAL_SERVER_ERROR if an error occurs during database access', async () => {
      const symbol = 'AAPL';
      jest
        .spyOn(prismaService.stockPrice, 'findMany')
        .mockImplementation(() => {
          throw new Error('Database error');
        });
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await expect(stockService.getMovingAverage(symbol)).rejects.toThrow(
        new HttpException(
          'Error calculating moving average.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `Error calculating moving average: Database error`,
      );
    });
  });

  describe('handleCron', () => {
    it('should fetch stock info for each symbol in the list', async () => {
      const symbol = 'AAPL';
      const mockPrice = 150.0;
      stockService.startPriceCheck(symbol);
      jest.spyOn(stockService, 'getStockInfo').mockResolvedValue({
        symbol,
        price: mockPrice,
        timestamp: new Date(),
        id: 1,
      });

      await stockService.handleCron();

      expect(stockService.getStockInfo).toHaveBeenCalledWith(symbol);
    });

    it('should fetch stock info for each symbol in the list', async () => {
      const symbol = 'AAPL';
      stockService.startPriceCheck(symbol);
      jest.spyOn(stockService, 'getStockInfo').mockImplementation(() => {
        throw new Error('Stock price fetching error');
      });
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await stockService.handleCron();

      expect(stockService.getStockInfo).toThrow(
        new Error('Stock price fetching error'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `Error fetching price for ${symbol}: Stock price fetching error`,
      );
    });
  });

  describe('startPriceCheck', () => {
    it('should add a symbol to the stockSymbols set', () => {
      const symbol = 'AAPL';
      stockService.startPriceCheck(symbol);
      expect(stockService['stockSymbols'].has(symbol)).toBe(true);
    });
  });
});
