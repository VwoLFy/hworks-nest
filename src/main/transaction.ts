import { DataSource, EntityManager } from 'typeorm';
import { HttpException, Injectable } from '@nestjs/common';
import { HTTP_Status } from './types/enums';

@Injectable()
export abstract class BaseTransaction<TransactionInput, TransactionOutput> {
  protected constructor(public dataSource: DataSource) {}
  // this function will contain all operations that you need to perform
  // and has to be implemented in all transaction classes
  protected abstract onExecute(data: TransactionInput, manager: EntityManager): Promise<TransactionOutput>;

  // this is the main function that runs the transaction
  async run(data: TransactionInput): Promise<TransactionOutput> {
    // since everything in Nest.js is a singleton we should create a separate
    // QueryRunner instance for each call
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const manager = queryRunner.manager;
    await queryRunner.startTransaction();

    try {
      const result = await this.onExecute(data, manager);
      await queryRunner.commitTransaction();

      return result;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      //console.log('Transaction failed');
      //console.log(e);
      if (e.status === HTTP_Status.NOT_FOUND_404 || e.status === HTTP_Status.FORBIDDEN_403)
        throw new HttpException(e.response.message, e.status);
    } finally {
      await queryRunner.release();
    }
  }

  // this is a function that allows us to use other "transaction" classes
  // inside any other "main" transaction, i.e. without creating a new DB transaction

  // async runWithoutTransaction(data: TransactionInput, manager: EntityManager): Promise<TransactionOutput> {
  //   return this.onExecute(data, manager);
  // }
}
