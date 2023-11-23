export type User = {
  id: string;
  created_at: Date;
  first_name: string;
  last_name: string;
  login: string;
  password: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
};
