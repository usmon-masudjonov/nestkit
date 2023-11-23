type ClassValidatorExceptionResponse = {
  message: string[];
};

export type ClassValidatorException = Error & {
  response: ClassValidatorExceptionResponse;
};
