import { post } from "./client";

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export async function signup(email: string, password: string): Promise<string> {
  const result = await post<AuthToken>("/auth/signup", { email, password });
  return result.access_token;
}

export async function login(email: string, password: string): Promise<string> {
  const result = await post<AuthToken>("/auth/login", { email, password });
  return result.access_token;
}
