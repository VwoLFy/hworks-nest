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
    const data = await this.dataSource.query(`SELECT "Id" FROM public."Users";`);
    console.log(data);
    return data;
  }

  @Get('/sql/add')
  async addData() {
    await this.dataSource.query(`INSERT INTO public."Users"("Id") VALUES (default);`);
  }

  @Get('/sql/delete')
  async deleteData() {
    await this.dataSource.query(`DELETE FROM public."Users"`);
  }
}
