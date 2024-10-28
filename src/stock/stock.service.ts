import {Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {Cron, CronExpression} from '@nestjs/schedule';
import {PrismaService} from '../prisma/prisma.service';
import {firstValueFrom} from "rxjs";
import {StockPrice} from '@prisma/client';

@Injectable()
export class StockService {
    private stockSymbols: Set<string> = new Set();

    constructor(
        private readonly httpService: HttpService,
        private readonly prisma: PrismaService,
    ) {}

    async getStockInfo(symbol: string): Promise<StockPrice> {
        const API_KEY = process.env.FINNHUB_API_KEY;
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
        const response = await firstValueFrom(this.httpService.get(url));
        const price = response.data.c;

        return this.prisma.stockPrice.create({
            data: {symbol, price},
        });
    }

    async getMovingAverage(symbol: string): Promise<number | null> {
        const prices = await this.prisma.stockPrice.findMany({
            where: { symbol },
            orderBy: { timestamp: 'desc' },
            take: 10,
        });

        if (prices.length < 10) return null;
        const sum = prices.reduce((acc, record) => acc + record.price, 0);
        return sum / prices.length;
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        for (const symbol of this.stockSymbols) {
            await this.getStockInfo(symbol);
            console.log(`Fetched price for ${symbol}`);
        }
    }

    startPriceCheck(symbol: string) {
        this.stockSymbols.add(symbol);
    }
}
