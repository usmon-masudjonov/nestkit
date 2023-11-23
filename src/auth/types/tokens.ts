export type AccessTokenPayload = {
  id: string;
  first_name: string;
  last_name: string;
  login: string;
  email: string;
};

export type RefreshTokenPayload = {
  id: string;
};
