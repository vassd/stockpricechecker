import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { StockPrice } from '@prisma/client';
import { AxiosResponse } from 'axios';

@Injectable()
export class StockService {
  private stockSymbols: Set<string> = new Set();

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async getStockInfo(symbol: string): Promise<StockPrice> {
    const API_KEY: string = process.env.FINNHUB_API_KEY;
    const url: string = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(url),
    );
    const price: number = response.data.c;

    return this.prisma.stockPrice.create({
      data: { symbol, price },
    });
  }

  async getMovingAverage(symbol: string): Promise<number | null> {
    const prices: StockPrice[] = await this.prisma.stockPrice.findMany({
      where: { symbol },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    if (prices.length < 10) {
      return null;
    } else {
      const sum: number = prices.reduce(
        (acc: number, record: StockPrice): number => acc + record.price,
        0,
      );

      return sum / prices.length;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    for (const symbol of this.stockSymbols) {
      await this.getStockInfo(symbol);
      console.log(`Fetched price for ${symbol}`);
    }
  }

  startPriceCheck(symbol: string): void {
    this.stockSymbols.add(symbol);
  }
}
