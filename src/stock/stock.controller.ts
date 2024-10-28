import { Controller, Get, Put, Param } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @Get(':symbol')
    async getStockInfo(@Param('symbol') symbol: string) {
        const symbolInfo = await this.stockService.getStockInfo(symbol);
        const movingAverage = await this.stockService.getMovingAverage(symbol);

        return { ...symbolInfo, movingAverage };
    }

    @Put(':symbol')
    startPriceCheck(@Param('symbol') symbol: string) {
        this.stockService.startPriceCheck(symbol);
        return { message: `Started price checks for ${symbol}` };
    }
}