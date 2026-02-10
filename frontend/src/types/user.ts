export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isAdmin: boolean;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  avatar?: File | null;
}
