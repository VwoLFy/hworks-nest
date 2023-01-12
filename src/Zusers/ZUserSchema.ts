import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, model, Model } from 'mongoose';
import { InputModelType } from './ZUsersController';

@Schema()
export class ZUser {
  @Prop({
    required: true,
    default: 17,
  })
  age: number;

  @Prop({ required: true })
  name: string;

  setName(name: string) {
    this.name = name;
  }

  static createHZ(
    ZUserModel: Model<ZUserDocument> & StaticsZUserType,
    input: InputModelType,
  ) {
    return new ZUserModel(input.age);
  }
  static createHZ2(input: InputModelType) {
    return new HZModel(input.age);
  }
}
export type ZUserDocument = HydratedDocument<ZUser>;
export type StaticsZUserType = Model<ZUser> & {
  createHZ(
    UserModel: Model<ZUserDocument> & StaticsZUserType,
    input: InputModelType,
  );
  createHZ2(input: InputModelType);
};

export const ZUserSchema = SchemaFactory.createForClass(ZUser);
ZUserSchema.loadClass(ZUser);

export const HZModel = model('sds', ZUserSchema);
