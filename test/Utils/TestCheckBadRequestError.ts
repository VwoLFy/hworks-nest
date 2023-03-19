export type BadRequestError = {
  errorsMessages: { message: string; field: string }[];
};
export const testCheckBadRequestError = (apiErrorResult: BadRequestError, field: string) => {
  expect(apiErrorResult).toEqual({
    errorsMessages: [
      {
        message: expect.any(String),
        field: field,
      },
    ],
  });
};
