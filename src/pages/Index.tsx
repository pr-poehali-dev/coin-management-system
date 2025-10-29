import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { User, Coin, Settings, loadFromStorage } from '@/types';
import LoginForm from '@/components/LoginForm';
import AppHeader from '@/components/AppHeader';
import MonitoringTab from '@/components/MonitoringTab';
import CoinsTab from '@/components/CoinsTab';
import UsersTab from '@/components/UsersTab';
import SettingsTab from '@/components/SettingsTab';
import EditCoinDialog from '@/components/EditCoinDialog';

export default function Index() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(() => loadFromStorage('coin-monitor-auth', false));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage('coin-monitor-current-user', null));
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
    const newCurrency = { code: code.toUpperCase(), symbol, rate: parseFloat(rate) };
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
      <LoginForm 
        users={users}
        setUsers={setUsers}
        setCurrentUser={setCurrentUser}
        setIsAuthenticated={setIsAuthenticated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <AppHeader 
        siteName={settings.siteName}
        currentUser={currentUser}
        activeCurrencyData={activeCurrencyData}
        convertPrice={convertPrice}
        handleLogout={handleLogout}
      />

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

          <TabsContent value="monitoring">
            <MonitoringTab 
              coins={coins}
              activeCurrencyData={activeCurrencyData}
              convertPrice={convertPrice}
            />
          </TabsContent>

          <TabsContent value="coins">
            <CoinsTab 
              coins={coins}
              canManageCoins={canManageCoins}
              activeCurrencyData={activeCurrencyData}
              convertPrice={convertPrice}
              handleAddCoin={handleAddCoin}
              handleEditCoin={handleEditCoin}
              handleDeleteCoin={handleDeleteCoin}
              newCoin={newCoin}
              setNewCoin={setNewCoin}
              addCoinDialogOpen={addCoinDialogOpen}
              setAddCoinDialogOpen={setAddCoinDialogOpen}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab 
              users={users}
              currentUser={currentUser}
              canManageCoins={canManageCoins}
              isAdmin={isAdmin}
              activeCurrencyData={activeCurrencyData}
              convertPrice={convertPrice}
              handleAddUser={handleAddUser}
              handleDeleteUser={handleDeleteUser}
              handleChangeUserRole={handleChangeUserRole}
              handleGiveBalance={handleGiveBalance}
              newUserData={newUserData}
              setNewUserData={setNewUserData}
              addUserDialogOpen={addUserDialogOpen}
              setAddUserDialogOpen={setAddUserDialogOpen}
              giveBalanceDialogOpen={giveBalanceDialogOpen}
              setGiveBalanceDialogOpen={setGiveBalanceDialogOpen}
              selectedUserForBalance={selectedUserForBalance}
              setSelectedUserForBalance={setSelectedUserForBalance}
              balanceAmount={balanceAmount}
              setBalanceAmount={setBalanceAmount}
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="settings">
              <SettingsTab 
                settings={settings}
                setSettings={setSettings}
                handleAddCurrency={handleAddCurrency}
                handleDeleteCurrency={handleDeleteCurrency}
                canManageCoins={canManageCoins}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <EditCoinDialog 
        open={editCoinDialogOpen}
        onOpenChange={setEditCoinDialogOpen}
        editingCoin={editingCoin}
        editCoinData={editCoinData}
        setEditCoinData={setEditCoinData}
        handleSaveEditCoin={handleSaveEditCoin}
      />
    </div>
  );
}
