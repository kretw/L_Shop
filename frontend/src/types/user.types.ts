export interface IUserPublic {
  id: string;
  username: string;
  email: string;
  phone: string;
  createdAt: string;
  cartId: string;
}

export interface IRegisterBody {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface ILoginBody {
  login: string;
  password: string;
}

// Стейт авторизации
export interface IAuthState {
  isLoggedIn: boolean;
  user: IUserPublic | null;
}