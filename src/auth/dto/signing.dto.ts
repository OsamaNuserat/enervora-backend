export class SignupDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class SigninDto {
  email: string;
  password: string;
}
