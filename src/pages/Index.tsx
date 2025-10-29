import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type User = {
  username: string;
  role: 'Админ' | 'Модер' | 'Пользователь';
  balance: number;
};

type Coin = {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number;
  volume: number;
};

type Currency = {
  code: string;
  symbol: string;
  rate: number;
};

type Settings = {
  siteName: string;
  currencies: Currency[];
  activeCurrency: string;
};

const ADMIN_PASSWORD = '228228333';

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export default function Index() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(() => loadFromStorage('coin-monitor-auth', false));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage('coin-monitor-current-user', null));
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [addCoinDialogOpen, setAddCoinDialogOpen] = useState(false);
  const [newCoin, setNewCoin] = useState({ name: '', symbol: '', value: '', volume: '' });
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ username: '', role: 'Пользователь' as 'Админ' | 'Модер' | 'Пользователь' });
  const [editCoinDialogOpen, setEditCoinDialogOpen] = useState(false);
  const [editingCoin, setEditingCoin] = useState<Coin | null>(null);
  const [editCoinData, setEditCoinData] = useState({ value: '', change: '', volume: '' });
  const [giveBalanceDialogOpen, setGiveBalanceDialogOpen] = useState(false);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');

  const [settings, setSettings] = useState<Settings>(() => 
    loadFromStorage('coin-monitor-settings', {
      siteName: 'Мониторинг валют',
      currencies: [
        { code: 'USD', symbol: '$', rate: 1 },
        { code: 'EUR', symbol: '€', rate: 0.92 },
        { code: 'RUB', symbol: '₽', rate: 92 },
      ],
      activeCurrency: 'USD',
    })
  );

  const [coins, setCoins] = useState<Coin[]>(() =>
    loadFromStorage('coin-monitor-coins', [
      { id: '1', name: 'Bitcoin', symbol: 'BTC', value: 67420, change: 2.5, volume: 28500000000 },
      { id: '2', name: 'Ethereum', symbol: 'ETH', value: 3240, change: -1.2, volume: 15200000000 },
      { id: '3', name: 'Solana', symbol: 'SOL', value: 145, change: 5.8, volume: 2400000000 },
    ])
  );

  const [users, setUsers] = useState<User[]>(() => loadFromStorage('coin-monitor-users', []));

  useEffect(() => {
    localStorage.setItem('coin-monitor-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('coin-monitor-coins', JSON.stringify(coins));
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('coin-monitor-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('coin-monitor-auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('coin-monitor-current-user', JSON.stringify(currentUser));
  }, [currentUser]);

  const activeCurrencyData = settings.currencies.find(c => c.code === settings.activeCurrency) || settings.currencies[0];

  const convertPrice = (usdPrice: number) => {
    return usdPrice * activeCurrencyData.rate;
  };

  const handleLogin = () => {
    if (!loginUsername || !loginPassword) {
      toast({
        title: 'Ошибка',
        description: 'Введите имя пользователя и пароль',
        variant: 'destructive',
      });
      return;
    }

    if (loginUsername === 'Sabzara' && loginPassword === ADMIN_PASSWORD) {
      const existingAdmin = users.find(u => u.username === 'Sabzara');
      const user: User = existingAdmin || { username: 'Sabzara', role: 'Админ', balance: 0 };
      if (!existingAdmin) {
        setUsers([...users, user]);
      }
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы вошли как администратор',
      });
    } else if (loginPassword === ADMIN_PASSWORD) {
      const existingUser = users.find(u => u.username === loginUsername);
      if (existingUser) {
        setCurrentUser(existingUser);
        setIsAuthenticated(true);
        toast({
          title: 'Добро пожаловать!',
          description: `Вы вошли как ${existingUser.role.toLowerCase()}`,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Пользователь не найден. Обратитесь к администратору',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive',
      });
    }
  };

  const handleAddCoin = () => {
    if (!newCoin.name || !newCoin.symbol || !newCoin.value || !newCoin.volume) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const coin: Coin = {
      id: Date.now().toString(),
      name: newCoin.name,
      symbol: newCoin.symbol.toUpperCase(),
      value: parseFloat(newCoin.value),
      change: 0,
      volume: parseFloat(newCoin.volume),
    };

    setCoins([...coins, coin]);
    setNewCoin({ name: '', symbol: '', value: '', volume: '' });
    setAddCoinDialogOpen(false);
    toast({
      title: 'Успешно!',
      description: `Монета ${coin.name} добавлена`,
    });
  };

  const handleDeleteCoin = (coinId: string) => {
    const coin = coins.find(c => c.id === coinId);
    setCoins(coins.filter(c => c.id !== coinId));
    toast({
      title: 'Монета удалена',
      description: `${coin?.name} удалена из системы`,
    });
  };

  const handleAddUser = () => {
    if (!newUserData.username) {
      toast({
        title: 'Ошибка',
        description: 'Введите имя пользователя',
        variant: 'destructive',
      });
      return;
    }

    if (users.some(u => u.username === newUserData.username) || newUserData.username === currentUser?.username) {
      toast({
        title: 'Ошибка',
        description: 'Пользователь уже существует',
        variant: 'destructive',
      });
      return;
    }

    const user: User = {
      username: newUserData.username,
      role: newUserData.role,
      balance: 0,
    };

    setUsers([...users, user]);
    setNewUserData({ username: '', role: 'Пользователь' });
    setAddUserDialogOpen(false);
    toast({
      title: 'Успешно!',
      description: `Пользователь ${user.username} добавлен с ролью ${user.role}`,
    });
  };

  const handleDeleteUser = (username: string) => {
    setUsers(users.filter(u => u.username !== username));
    toast({
      title: 'Пользователь удалён',
      description: `${username} удалён из системы`,
    });
  };

  const handleChangeUserRole = (username: string, newRole: 'Админ' | 'Модер' | 'Пользователь') => {
    const updatedUsers = users.map(u => u.username === username ? { ...u, role: newRole } : u);
    setUsers(updatedUsers);
    
    if (currentUser?.username === username) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
    
    toast({
      title: 'Роль изменена',
      description: `${username} теперь ${newRole}`,
    });
  };

  const handleEditCoin = (coin: Coin) => {
    setEditingCoin(coin);
    setEditCoinData({
      value: coin.value.toString(),
      change: coin.change.toString(),
      volume: coin.volume.toString(),
    });
    setEditCoinDialogOpen(true);
  };

  const handleSaveEditCoin = () => {
    if (!editingCoin || !editCoinData.value || !editCoinData.volume) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setCoins(coins.map(c => 
      c.id === editingCoin.id 
        ? { ...c, value: parseFloat(editCoinData.value), change: parseFloat(editCoinData.change || '0'), volume: parseFloat(editCoinData.volume) }
        : c
    ));
    setEditCoinDialogOpen(false);
    setEditingCoin(null);
    toast({
      title: 'Успешно!',
      description: `Данные монеты ${editingCoin.name} обновлены`,
    });
  };

  const handleAddCurrency = (code: string, symbol: string, rate: string) => {
    if (!code || !symbol || !rate) return;
    const newCurrency: Currency = { code: code.toUpperCase(), symbol, rate: parseFloat(rate) };
    setSettings({ ...settings, currencies: [...settings.currencies, newCurrency] });
    toast({
      title: 'Валюта добавлена',
      description: `${code} успешно добавлена`,
    });
  };

  const handleDeleteCurrency = (code: string) => {
    if (settings.currencies.length <= 1) {
      toast({
        title: 'Ошибка',
        description: 'Должна остаться хотя бы одна валюта',
        variant: 'destructive',
      });
      return;
    }
    setSettings({ 
      ...settings, 
      currencies: settings.currencies.filter(c => c.code !== code),
      activeCurrency: settings.activeCurrency === code ? settings.currencies[0].code : settings.activeCurrency
    });
    toast({
      title: 'Валюта удалена',
      description: `${code} удалена из системы`,
    });
  };

  const handleGiveBalance = () => {
    if (!selectedUserForBalance || !balanceAmount) {
      toast({
        title: 'Ошибка',
        description: 'Выберите пользователя и укажите сумму',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Укажите корректную сумму',
        variant: 'destructive',
      });
      return;
    }

    setUsers(users.map(u => 
      u.username === selectedUserForBalance.username 
        ? { ...u, balance: u.balance + amount }
        : u
    ));

    if (currentUser?.username === selectedUserForBalance.username) {
      setCurrentUser({ ...currentUser, balance: currentUser.balance + amount });
    }

    toast({
      title: 'Успешно!',
      description: `${amount} ${activeCurrencyData.symbol} выдано пользователю ${selectedUserForBalance.username}`,
    });

    setGiveBalanceDialogOpen(false);
    setSelectedUserForBalance(null);
    setBalanceAmount('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast({
      title: 'До свидания!',
      description: 'Вы вышли из системы',
    });
  };

  const canManageCoins = currentUser?.role === 'Админ' || currentUser?.role === 'Модер';
  const isAdmin = currentUser?.role === 'Админ';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md border-border/50 shadow-2xl animate-fade-in">
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-2">
              <Icon name="Coins" size={32} className="text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Мониторинг валют</CardTitle>
            <CardDescription>Войдите для доступа к системе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                placeholder="Введите имя"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full h-11 text-base font-semibold">
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Icon name="Coins" size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{settings.siteName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-lg">
                <Icon name="Wallet" size={20} className="text-primary" />
                <span className="font-bold text-lg">{convertPrice(currentUser?.balance || 0).toFixed(2)} {activeCurrencyData.symbol}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="User" size={18} className="text-muted-foreground" />
                <span className="font-medium">{currentUser?.username}</span>
                <Badge variant={currentUser?.role === 'Админ' ? 'default' : 'secondary'}>
                  {currentUser?.role}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <Icon name="LogOut" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 h-12">
            <TabsTrigger value="monitoring" className="text-base">
              <Icon name="BarChart3" size={18} className="mr-2" />
              Мониторинг
            </TabsTrigger>
            <TabsTrigger value="coins" className="text-base">
              <Icon name="Coins" size={18} className="mr-2" />
              Монеты
            </TabsTrigger>
            <TabsTrigger value="users" className="text-base">
              <Icon name="Users" size={18} className="mr-2" />
              Пользователи
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="settings" className="text-base">
                <Icon name="Settings" size={18} className="mr-2" />
                Настройки
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardDescription>Всего монет</CardDescription>
                  <CardTitle className="text-4xl font-bold">{coins.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardDescription>Общий объём</CardDescription>
                  <CardTitle className="text-4xl font-bold">
                    {activeCurrencyData.symbol}{(coins.reduce((sum, coin) => sum + convertPrice(coin.volume), 0) / 1e9).toFixed(1)}B
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardDescription>Средний рост</CardDescription>
                  <CardTitle className="text-4xl font-bold text-green-500">
                    +{(coins.reduce((sum, coin) => sum + coin.change, 0) / coins.length).toFixed(1)}%
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid gap-4">
              {coins.map((coin) => (
                <Card key={coin.id} className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <span className="font-bold text-lg">{coin.symbol[0]}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{coin.name}</h3>
                          <p className="text-muted-foreground">{coin.symbol}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-16 flex items-center justify-center ${coin.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          <Icon name={coin.change > 0 ? 'TrendingUp' : 'TrendingDown'} size={48} strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{activeCurrencyData.symbol}{convertPrice(coin.value).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        <p className={`text-sm font-semibold ${coin.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {coin.change > 0 ? '+' : ''}{coin.change}%
                        </p>
                      </div>
                      <div className="text-right text-muted-foreground">
                        <p className="text-sm">Объём 24ч</p>
                        <p className="font-semibold">{activeCurrencyData.symbol}{(convertPrice(coin.volume) / 1e9).toFixed(2)}B</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coins" className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Управление монетами</h2>
              {canManageCoins && (
                <Dialog open={addCoinDialogOpen} onOpenChange={setAddCoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Icon name="Plus" size={18} />
                      Добавить монету
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить новую монету</DialogTitle>
                      <DialogDescription>Заполните данные о новой валюте</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="coin-name">Название</Label>
                        <Input
                          id="coin-name"
                          placeholder="Bitcoin"
                          value={newCoin.name}
                          onChange={(e) => setNewCoin({ ...newCoin, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coin-symbol">Символ</Label>
                        <Input
                          id="coin-symbol"
                          placeholder="BTC"
                          value={newCoin.symbol}
                          onChange={(e) => setNewCoin({ ...newCoin, symbol: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coin-value">Цена ($)</Label>
                        <Input
                          id="coin-value"
                          type="number"
                          placeholder="67420"
                          value={newCoin.value}
                          onChange={(e) => setNewCoin({ ...newCoin, value: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coin-volume">Объём 24ч ($)</Label>
                        <Input
                          id="coin-volume"
                          type="number"
                          placeholder="28500000000"
                          value={newCoin.volume}
                          onChange={(e) => setNewCoin({ ...newCoin, volume: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddCoin} className="w-full">
                        Добавить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {!canManageCoins && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="pt-6 flex items-center gap-3">
                  <Icon name="Lock" size={20} className="text-destructive" />
                  <p className="text-sm">Только модераторы и администраторы могут управлять монетами</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {coins.map((coin) => (
                <Card key={coin.id} className="border-border/50">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="font-bold text-lg">{coin.symbol[0]}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{coin.name}</h3>
                        <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </div>
                    {canManageCoins && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCoin(coin)}>
                          <Icon name="Edit" size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить монету?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы уверены, что хотите удалить {coin.name}? Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCoin(coin.id)} className="bg-destructive hover:bg-destructive/90">
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Управление пользователями</h2>
              <div className="flex gap-3">
                {canManageCoins && (
                  <>
                    <Dialog open={giveBalanceDialogOpen} onOpenChange={setGiveBalanceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Icon name="Wallet" size={18} />
                          Выдать валюту
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Выдать валюту пользователю</DialogTitle>
                          <DialogDescription>Выберите пользователя и укажите сумму</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Пользователь</Label>
                            <Select 
                              value={selectedUserForBalance?.username || ''} 
                              onValueChange={(username) => {
                                const user = [...users, currentUser].find(u => u?.username === username);
                                setSelectedUserForBalance(user || null);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите пользователя" />
                              </SelectTrigger>
                              <SelectContent>
                                {currentUser && (
                                  <SelectItem value={currentUser.username}>{currentUser.username} (Вы)</SelectItem>
                                )}
                                {users.map((user) => (
                                  <SelectItem key={user.username} value={user.username}>
                                    {user.username}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="balance-amount">Сумма ({activeCurrencyData.symbol})</Label>
                            <Input
                              id="balance-amount"
                              type="number"
                              step="0.01"
                              placeholder="100"
                              value={balanceAmount}
                              onChange={(e) => setBalanceAmount(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleGiveBalance} className="w-full">
                            Выдать
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Icon name="UserPlus" size={18} />
                          Добавить пользователя
                        </Button>
                      </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить пользователя</DialogTitle>
                      <DialogDescription>Создайте нового пользователя и назначьте роль</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-name">Имя пользователя</Label>
                        <Input
                          id="user-name"
                          placeholder="Введите имя"
                          value={newUserData.username}
                          onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                        />
                      </div>
                      {isAdmin && (
                        <div className="space-y-2">
                          <Label htmlFor="user-role">Роль</Label>
                          <Select value={newUserData.role} onValueChange={(value: 'Админ' | 'Модер' | 'Пользователь') => setNewUserData({ ...newUserData, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Пользователь">Пользователь</SelectItem>
                              <SelectItem value="Модер">Модер</SelectItem>
                              <SelectItem value="Админ">Админ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <Button onClick={handleAddUser} className="w-full">
                        Добавить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="space-y-4">
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon name="User" size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{currentUser?.username}</h3>
                        <p className="text-sm text-muted-foreground">Вы (текущий пользователь)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Баланс</p>
                        <p className="text-lg font-bold">{convertPrice(currentUser?.balance || 0).toFixed(2)} {activeCurrencyData.symbol}</p>
                      </div>
                      <Badge variant={currentUser?.role === 'Админ' ? 'default' : 'secondary'} className="text-sm px-4 py-1">
                        {currentUser?.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {users.map((user) => (
                <Card key={user.username} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Icon name="User" size={24} className="text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{user.username}</h3>
                          <p className="text-sm text-muted-foreground">Баланс: {convertPrice(user.balance || 0).toFixed(2)} {activeCurrencyData.symbol}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAdmin ? (
                          <Select value={user.role} onValueChange={(value: 'Админ' | 'Модер' | 'Пользователь') => handleChangeUserRole(user.username, value)}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Пользователь">Пользователь</SelectItem>
                              <SelectItem value="Модер">Модер</SelectItem>
                              <SelectItem value="Админ">Админ</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={user.role === 'Админ' ? 'default' : 'secondary'} className="text-sm px-4 py-1">
                            {user.role}
                          </Badge>
                        )}
                        {canManageCoins && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы уверены, что хотите удалить {user.username}? Это действие нельзя отменить.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.username)} className="bg-destructive hover:bg-destructive/90">
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {users.length === 0 && (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Пока нет других пользователей</p>
                    {canManageCoins && (
                      <p className="text-sm text-muted-foreground mt-2">Добавьте первого пользователя</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="settings" className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold">Настройки системы</h2>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Основные настройки</CardTitle>
                  <CardDescription>Настройте название и отображение сайта</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Название сайта</Label>
                    <Input
                      id="site-name"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Управление валютами</CardTitle>
                  <CardDescription>Добавляйте валюты и управляйте курсами</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Активная валюта</Label>
                    <Select value={settings.activeCurrency} onValueChange={(value) => setSettings({ ...settings, activeCurrency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <Label>Список валют (доступно для Админа и Модера)</Label>
                    {settings.currencies.map((currency) => (
                      <div key={currency.code} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-bold">{currency.symbol}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{currency.code}</p>
                            <p className="text-sm text-muted-foreground">Курс: {currency.rate}</p>
                          </div>
                        </div>
                        {settings.currencies.length > 1 && canManageCoins && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить валюту?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Удалить {currency.code} из системы?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCurrency(currency.code)} className="bg-destructive hover:bg-destructive/90">
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full gap-2">
                        <Icon name="Plus" size={18} />
                        Добавить валюту
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Добавить новую валюту</DialogTitle>
                        <DialogDescription>Заполните данные о валюте</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="currency-code">Код валюты</Label>
                          <Input id="currency-code" placeholder="USD" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency-symbol">Символ</Label>
                          <Input id="currency-symbol" placeholder="$" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency-rate">Курс к USD</Label>
                          <Input id="currency-rate" type="number" step="0.01" placeholder="1" />
                        </div>
                        <Button
                          onClick={() => {
                            const code = (document.getElementById('currency-code') as HTMLInputElement)?.value;
                            const symbol = (document.getElementById('currency-symbol') as HTMLInputElement)?.value;
                            const rate = (document.getElementById('currency-rate') as HTMLInputElement)?.value;
                            handleAddCurrency(code, symbol, rate);
                          }}
                          className="w-full"
                        >
                          Добавить
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <Dialog open={editCoinDialogOpen} onOpenChange={setEditCoinDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактировать монету</DialogTitle>
                <DialogDescription>Измените данные монеты {editingCoin?.name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-coin-value">Цена ({activeCurrencyData.symbol})</Label>
                  <Input
                    id="edit-coin-value"
                    type="number"
                    placeholder="67420"
                    value={editCoinData.value}
                    onChange={(e) => setEditCoinData({ ...editCoinData, value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-coin-change">Изменение (%)</Label>
                  <Input
                    id="edit-coin-change"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={editCoinData.change}
                    onChange={(e) => setEditCoinData({ ...editCoinData, change: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-coin-volume">Объём 24ч ({activeCurrencyData.symbol})</Label>
                  <Input
                    id="edit-coin-volume"
                    type="number"
                    placeholder="28500000000"
                    value={editCoinData.volume}
                    onChange={(e) => setEditCoinData({ ...editCoinData, volume: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveEditCoin} className="w-full">
                  Сохранить
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Tabs>
      </main>
    </div>
  );
}