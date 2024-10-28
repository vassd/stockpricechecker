import { Controller, Get, Put, Param } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockPrice } from "@prisma/client";

@Controller('stock')
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @Get(':symbol')
    async getStockInfo(@Param('symbol') symbol: string): Promise<{}> {
        const symbolInfo: StockPrice = await this.stockService.getStockInfo(symbol);
        const movingAverage: number = await this.stockService.getMovingAverage(symbol);

        return { ...symbolInfo, movingAverage };
    }

    @Put(':symbol')
    startPriceCheck(@Param('symbol') symbol: string): {message: string} {
        this.stockService.startPriceCheck(symbol);
        return { message: `Started price checks for ${symbol}` };
    }
}
