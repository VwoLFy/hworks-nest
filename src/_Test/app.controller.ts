import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Controller()
export class AppController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/sql')
  async getData() {
    const data = await this.dataSource.query(
      `SELECT "Id", "Name", "Age", "Balance"
            FROM public."Test_Table";`,
    );
    console.log(data);
    return data;
  }
}
