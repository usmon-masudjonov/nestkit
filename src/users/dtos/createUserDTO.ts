export interface CreateUserDTO {
  first_name: string;
  last_name: string;
  login: string;
  password: string | null;
  email: string;
  is_verified: boolean;
}
