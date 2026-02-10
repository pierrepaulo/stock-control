export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isAdmin: boolean;
  token: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isAdmin: boolean;
}
