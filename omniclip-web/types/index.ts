import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

export interface User {
  id: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  created_at: string;
  max_allowed_devices: number;
  plan_type: string;
}

export interface Device {
  id: string;
  name: string;
  os: string;
  user_id: string;
  user_email: string;
  last_sync: string;
}

export interface PromoCode {
  code: string;
  device_boost_count: number;
  usage_limit: number;
  times_used: number;
  expiry_date: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  role: "user" | "admin" | "super_admin";
  email: string;
  id: string;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: string;
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User {
    id?: string;
    email?: string | null;
    role?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    accessToken: string;
  }
}
