export type User = {
  username: string;
  password: string;
  role: 'Админ' | 'Модер' | 'Пользователь';
  balance: number;
};

export type Coin = {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number;
  volume: number;
};

export type Currency = {
  code: string;
  symbol: string;
  rate: number;
};

export type Settings = {
  siteName: string;
  currencies: Currency[];
  activeCurrency: string;
};

export const ADMIN_PASSWORD = '228228333';

export const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};