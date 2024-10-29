import { Controller, Get, Put, Param } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockPrice } from '@prisma/client';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

export interface StockInfoResponse {
  movingAverage: number;
  symbol: string;
  id: number;
  price: number;
  timestamp: Date;
}

@ApiTags('stocks')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get(':symbol')
  @ApiParam({
    name: 'symbol',
    required: true,
    description: 'The stock symbol to fetch info for',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the stock information and moving average',
  })
  @ApiResponse({ status: 404, description: 'Stock symbol not found' })
  async getStockInfo(
    @Param('symbol') symbol: string,
  ): Promise<StockInfoResponse> {
    const symbolInfo: StockPrice = await this.stockService.getStockInfo(symbol);
    const movingAverage: number =
      await this.stockService.getMovingAverage(symbol);

    return { ...symbolInfo, movingAverage };
  }

  @Put(':symbol')
  @ApiParam({
    name: 'symbol',
    required: true,
    description: 'The stock symbol to start price checks for',
  })
  @ApiResponse({
    status: 200,
    description: 'Started price checks for the given symbol',
  })
  startPriceCheck(@Param('symbol') symbol: string): { message: string } {
    this.stockService.startPriceCheck(symbol);

    return { message: `Started price checks for ${symbol}` };
  }
}
