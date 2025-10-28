import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type User = {
  username: string;
  role: 'Админ' | 'Модер' | 'Пользователь';
};

type Coin = {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number;
  volume: number;
};

const ADMIN_PASSWORD = '228228333';

export default function Index() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [addCoinDialogOpen, setAddCoinDialogOpen] = useState(false);
  const [newCoin, setNewCoin] = useState({ name: '', symbol: '', value: '', volume: '' });

  const [coins, setCoins] = useState<Coin[]>([
    { id: '1', name: 'Bitcoin', symbol: 'BTC', value: 67420, change: 2.5, volume: 28500000000 },
    { id: '2', name: 'Ethereum', symbol: 'ETH', value: 3240, change: -1.2, volume: 15200000000 },
    { id: '3', name: 'Solana', symbol: 'SOL', value: 145, change: 5.8, volume: 2400000000 },
  ]);

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
      const user: User = { username: 'Sabzara', role: 'Админ' };
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы вошли как администратор',
      });
    } else if (loginPassword === ADMIN_PASSWORD) {
      const user: User = { username: loginUsername, role: 'Модер' };
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы вошли как модератор',
      });
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

  const canManageCoins = currentUser?.role === 'Админ' || currentUser?.role === 'Модер';

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
            <h1 className="text-2xl font-bold">Мониторинг валют</h1>
          </div>
          <div className="flex items-center gap-4">
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
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentUser(null);
              }}
            >
              <Icon name="LogOut" size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-12">
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
                    ${(coins.reduce((sum, coin) => sum + coin.volume, 0) / 1e9).toFixed(1)}B
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
                      <div className="text-right">
                        <p className="text-2xl font-bold">${coin.value.toLocaleString()}</p>
                        <p className={`text-sm font-semibold ${coin.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {coin.change > 0 ? '+' : ''}{coin.change}%
                        </p>
                      </div>
                      <div className="text-right text-muted-foreground">
                        <p className="text-sm">Объём 24ч</p>
                        <p className="font-semibold">${(coin.volume / 1e9).toFixed(2)}B</p>
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
                      <Button variant="outline" size="sm">
                        <Icon name="Edit" size={16} />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Авторизованные пользователи</h2>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Icon name="User" size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{currentUser?.username}</h3>
                      <p className="text-sm text-muted-foreground">Текущий пользователь</p>
                    </div>
                  </div>
                  <Badge variant={currentUser?.role === 'Админ' ? 'default' : 'secondary'} className="text-sm px-4 py-1">
                    {currentUser?.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
