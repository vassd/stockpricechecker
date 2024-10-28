import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(url),
      );
      const price: number = response.data.c;

      if (!price) {
        throw new HttpException(
          `Stock symbol "${symbol}" not found.`,
          HttpStatus.NOT_FOUND,
        );
      }

      return this.prisma.stockPrice.create({
        data: { symbol, price },
      });
    } catch (error) {
      if (error?.status === 404) {
        throw new HttpException(
          `Stock symbol "${symbol}" not found in the external API.`,
          HttpStatus.NOT_FOUND,
        );
      } else if (error?.status === 429) {
        throw new HttpException(
          'Too many requests to the external API. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else {
        throw new HttpException(
          'Error fetching stock price. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getMovingAverage(symbol: string): Promise<number | null> {
    try {
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
    } catch (error) {
      console.error(`Error calculating moving average: ${error.message}`);
      throw new HttpException(
        'Error calculating moving average.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    for (const symbol of this.stockSymbols) {
      try {
        await this.getStockInfo(symbol);
        console.log(`Fetched price for ${symbol}`);
      } catch (error) {
        console.error(`Error fetching price for ${symbol}: ${error.message}`);
      }
    }
  }

  startPriceCheck(symbol: string): void {
    this.stockSymbols.add(symbol);
  }
}
