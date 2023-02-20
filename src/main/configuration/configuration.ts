import * as process from 'process';

export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,

  PORT: process.env.PORT,

  MONGO_URI: process.env.MONGO_URI,
  MONGO_DATABASE: process.env.MONGO_DATABASE,

  TYPEORM_USERNAME: process.env.TYPEORM_USERNAME,
  TYPEORM_PASSWORD: process.env.TYPEORM_PASSWORD,
  TYPEORM_PORT: process.env.TYPEORM_PORT,
  TYPEORM_HOST: process.env.TYPEORM_HOST,
  TYPEORM_DATABASE: process.env.TYPEORM_DATABASE,

  JWT_SECRET_FOR_ACCESSTOKEN: process.env.JWT_SECRET_FOR_ACCESSTOKEN,
  EXPIRES_IN_TIME_OF_ACCESSTOKEN: process.env.EXPIRES_IN_TIME_OF_ACCESSTOKEN,
  JWT_SECRET_FOR_REFRESHTOKEN: process.env.JWT_SECRET_FOR_REFRESHTOKEN,
  EXPIRES_IN_TIME_OF_REFRESHTOKEN: process.env.EXPIRES_IN_TIME_OF_REFRESHTOKEN,

  SA_LOGIN: process.env.SA_LOGIN,
  SA_PASSWORD: process.env.SA_PASSWORD,

  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL: process.env.EMAIL,
  EMAIL_FROM: process.env.EMAIL_FROM,
  MY_EMAIL: process.env.MY_EMAIL,

  IP_RESTRICTION: process.env.IP_RESTRICTION,
});

export type EnvType = ReturnType<typeof configuration>;
