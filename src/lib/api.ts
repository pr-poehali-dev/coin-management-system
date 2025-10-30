const API_URL = 'https://functions.poehali.dev/9c8aaec1-6c4e-4fb1-a900-ce7dc03120c2';

export const api = {
  async getAllData() {
    const response = await fetch(`${API_URL}?path=all`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
  },

  async login(username: string, password: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        data: { username, password }
      })
    });
    return response.json();
  },

  async register(username: string, password: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        data: { username, password }
      })
    });
    return response.json();
  },

  async addUser(username: string, password: string, role: string, balance: number = 0) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_user',
        data: { username, password, role, balance }
      })
    });
    return response.json();
  },

  async addCurrency(code: string, symbol: string, rate: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_currency',
        data: { code, symbol, rate }
      })
    });
    return response.json();
  },

  async addCoin(name: string, symbol: string, value: string, change: string, volume: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_coin',
        data: { name, symbol, value, change, volume }
      })
    });
    return response.json();
  },

  async updateCoin(id: number, value: string, change: string, volume: string) {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_coin',
        data: { id, value, change, volume }
      })
    });
    return response.json();
  },

  async updateUserRole(id: number, role: string) {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_user_role',
        data: { id, role }
      })
    });
    return response.json();
  },

  async updateBalance(id: number, amount: number) {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_balance',
        data: { id, amount }
      })
    });
    return response.json();
  },

  async updateSettings(siteName: string, activeCurrency: string) {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_settings',
        data: { site_name: siteName, active_currency: activeCurrency }
      })
    });
    return response.json();
  },

  async deleteUser(id: number) {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_user',
        id
      })
    });
    return response.json();
  },

  async deleteCurrency(id: number) {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_currency',
        id
      })
    });
    return response.json();
  },

  async deleteCoin(id: number) {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_coin',
        id
      })
    });
    return response.json();
  }
};
