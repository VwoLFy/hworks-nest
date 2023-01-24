export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,

  PORT: process.env.PORT,

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_SECRET_FOR_REFRESHTOKEN: process.env.JWT_SECRET_FOR_REFRESHTOKEN,

  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL: process.env.EMAIL,
  EMAIL_FROM: process.env.EMAIL_FROM,
  MY_EMAIL: process.env.MY_EMAIL,
});

export type EnvType = ReturnType<typeof configuration>;
