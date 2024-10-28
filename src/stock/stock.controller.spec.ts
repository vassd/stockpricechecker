import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('StockController', () => {
  let stockController: StockController;
  let stockService: StockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: {
            getStockInfo: jest.fn(),
            getMovingAverage: jest.fn(),
            startPriceCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    stockController = module.get<StockController>(StockController);
    stockService = module.get<StockService>(StockService);
  });

  describe('getStockInfo', () => {
    it('should return stock info with moving average', async () => {
      const symbol = 'AAPL';
      const mockStockInfo = {
        id: 1,
        symbol,
        price: 150,
        timestamp: new Date(),
      };
      const mockMovingAverage = 148.5;

      jest.spyOn(stockService, 'getStockInfo').mockResolvedValue(mockStockInfo);
      jest
        .spyOn(stockService, 'getMovingAverage')
        .mockResolvedValue(mockMovingAverage);

      const result = await stockController.getStockInfo(symbol);
      expect(result).toEqual({
        ...mockStockInfo,
        movingAverage: mockMovingAverage,
      });
    });

    it('should throw an error if stock info is not found', async () => {
      const symbol = 'INVALID';
      jest.spyOn(stockService, 'getStockInfo').mockImplementation(() => {
        throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
      });

      await expect(stockController.getStockInfo(symbol)).rejects.toThrow(
        new HttpException('Stock not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('startPriceCheck', () => {
    it('should start price checks for a valid symbol', () => {
      const symbol = 'AAPL';
      const result = stockController.startPriceCheck(symbol);

      expect(stockService.startPriceCheck).toHaveBeenCalledWith(symbol);
      expect(result).toEqual({ message: `Started price checks for ${symbol}` });
    });
  });
});
