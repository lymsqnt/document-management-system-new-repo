export type DemoAccount = {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  password: string;
  address?: string;
  birthday?: string;
  gender?: string;
  profileImage?: string;
};

export type UserProfile = {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  address: string;
  birthday: string;
  gender: string;
  profileImage?: string;
};

export type SafeUser = Omit<DemoAccount, "password">;
