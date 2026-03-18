export interface IUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
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
  login: string; // email или username или phone
  password: string;
}

export interface IUserPublic {
  id: string;
  username: string;
  email: string;
  phone: string;
  createdAt: string;
  cartId: string;
}