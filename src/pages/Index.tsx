import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { User, Coin, Settings, loadFromStorage } from '@/types';
import { api } from '@/lib/api';
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
  const [newUserData, setNewUserData] = useState({ username: '', password: '', role: 'Пользователь' as 'Админ' | 'Модер' | 'Пользователь' });
  const [editCoinDialogOpen, setEditCoinDialogOpen] = useState(false);
  const [editingCoin, setEditingCoin] = useState<Coin | null>(null);
  const [editCoinData, setEditCoinData] = useState({ value: '', change: '', volume: '' });
  const [giveBalanceDialogOpen, setGiveBalanceDialogOpen] = useState(false);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<Settings>({
    siteName: 'Мониторинг валют',
    currencies: [],
    activeCurrency: 'USD',
  });

  const [coins, setCoins] = useState<Coin[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const loadData = async () => {
    try {
      const data = await api.getAllData();
      
      const formattedCoins = data.coins.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        value: parseFloat(coin.value),
        change: parseFloat(coin.change),
        volume: coin.volume
      }));
      
      const formattedCurrencies = data.currencies.map((curr: any) => ({
        id: curr.id,
        code: curr.code,
        symbol: curr.symbol,
        rate: parseFloat(curr.rate)
      }));
      
      setCoins(formattedCoins);
      setUsers(data.users);
      setSettings({
        siteName: data.settings?.site_name || 'Мониторинг валют',
        currencies: formattedCurrencies,
        activeCurrency: data.settings?.active_currency || 'USD'
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('coin-monitor-auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('coin-monitor-current-user', JSON.stringify(currentUser));
  }, [currentUser]);

  const activeCurrencyData = settings.currencies.find(c => c.code === settings.activeCurrency) || settings.currencies[0] || { code: 'USD', symbol: '$', rate: 1 };

  const convertPrice = (usdPrice: number) => {
    return usdPrice * (typeof activeCurrencyData.rate === 'number' ? activeCurrencyData.rate : parseFloat(String(activeCurrencyData.rate)));
  };

  const handleAddCoin = async () => {
    if (!newCoin.name || !newCoin.symbol || !newCoin.value || !newCoin.volume) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.addCoin(newCoin.name, newCoin.symbol.toUpperCase(), newCoin.value, '0', newCoin.volume);
      await loadData();
      setNewCoin({ name: '', symbol: '', value: '', volume: '' });
      setAddCoinDialogOpen(false);
      toast({
        title: 'Успешно!',
        description: `Монета ${newCoin.name} добавлена`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить монету',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCoin = async (coinId: string | number) => {
    const coin = coins.find(c => c.id == coinId);
    try {
      await api.deleteCoin(Number(coinId));
      await loadData();
      toast({
        title: 'Монета удалена',
        description: `${coin?.name} удалена из системы`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить монету',
        variant: 'destructive',
      });
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.username || !newUserData.password) {
      toast({
        title: 'Ошибка',
        description: 'Введите имя пользователя и пароль',
        variant: 'destructive',
      });
      return;
    }

    if (newUserData.password.length < 4) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 4 символов',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.addUser(newUserData.username, newUserData.password, newUserData.role, 0);
      await loadData();
      setNewUserData({ username: '', password: '', role: 'Пользователь' });
      setAddUserDialogOpen(false);
      toast({
        title: 'Успешно!',
        description: `Пользователь ${newUserData.username} добавлен`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Пользователь уже существует',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (username: string) => {
    const user = users.find(u => u.username === username);
    if (user && user.id) {
      try {
        await api.deleteUser(user.id);
        await loadData();
        toast({
          title: 'Пользователь удалён',
          description: `${username} удалён из системы`,
        });
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить пользователя',
          variant: 'destructive',
        });
      }
    }
  };

  const handleChangeUserRole = async (username: string, newRole: 'Админ' | 'Модер' | 'Пользователь') => {
    const user = users.find(u => u.username === username);
    if (user && user.id) {
      try {
        await api.updateUserRole(user.id, newRole);
        await loadData();
        
        if (currentUser?.username === username) {
          setCurrentUser({ ...currentUser, role: newRole });
        }
        
        toast({
          title: 'Роль изменена',
          description: `${username} теперь ${newRole}`,
        });
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось изменить роль',
          variant: 'destructive',
        });
      }
    }
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

  const handleSaveEditCoin = async () => {
    if (!editingCoin || !editCoinData.value || !editCoinData.volume) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.updateCoin(Number(editingCoin.id), editCoinData.value, editCoinData.change || '0', editCoinData.volume);
      await loadData();
      setEditCoinDialogOpen(false);
      setEditingCoin(null);
      toast({
        title: 'Успешно!',
        description: `Данные монеты ${editingCoin.name} обновлены`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные',
        variant: 'destructive',
      });
    }
  };

  const handleAddCurrency = async (code: string, symbol: string, rate: string) => {
    if (!code || !symbol || !rate) return;
    try {
      await api.addCurrency(code.toUpperCase(), symbol, rate);
      await loadData();
      toast({
        title: 'Валюта добавлена',
        description: `${code} успешно добавлена`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить валюту',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCurrency = async (code: string) => {
    if (settings.currencies.length <= 1) {
      toast({
        title: 'Ошибка',
        description: 'Должна остаться хотя бы одна валюта',
        variant: 'destructive',
      });
      return;
    }
    
    const currency = settings.currencies.find(c => c.code === code);
    if (currency && currency.id) {
      try {
        await api.deleteCurrency(currency.id);
        await loadData();
        toast({
          title: 'Валюта удалена',
          description: `${code} удалена из системы`,
        });
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить валюту',
          variant: 'destructive',
        });
      }
    }
  };

  const handleGiveBalance = async () => {
    if (!selectedUserForBalance || !balanceAmount) {
      toast({
        title: 'Ошибка',
        description: 'Выберите пользователя и укажите сумму',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount)) {
      toast({
        title: 'Ошибка',
        description: 'Некорректная сумма',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUserForBalance.id) {
      try {
        await api.updateBalance(selectedUserForBalance.id, amount);
        await loadData();
        
        if (currentUser?.id === selectedUserForBalance.id) {
          const updatedUser = users.find(u => u.id === selectedUserForBalance.id);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
        
        setGiveBalanceDialogOpen(false);
        setBalanceAmount('');
        setSelectedUserForBalance(null);
        toast({
          title: 'Баланс обновлён',
          description: `${selectedUserForBalance.username} получил ${amount} ${activeCurrencyData.symbol}`,
        });
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось обновить баланс',
          variant: 'destructive',
        });
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'Админ';
  const canManageCoins = currentUser?.role === 'Админ' || currentUser?.role === 'Модер';

  if (!isAuthenticated) {
    return <LoginForm users={users} setUsers={setUsers} setCurrentUser={setCurrentUser} setIsAuthenticated={setIsAuthenticated} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
          <p className="text-lg">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <AppHeader 
        siteName={settings.siteName}
        currentUser={currentUser}
        handleLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="monitoring" className="gap-2">
              <Icon name="TrendingUp" size={18} />
              Мониторинг
            </TabsTrigger>
            <TabsTrigger value="coins" className="gap-2">
              <Icon name="Coins" size={18} />
              Монеты
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Icon name="Users" size={18} />
              Пользователи
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="settings" className="gap-2">
                <Icon name="Settings" size={18} />
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
                setSettings={async (newSettings: Settings) => {
                  await api.updateSettings(newSettings.siteName, newSettings.activeCurrency);
                  setSettings(newSettings);
                }}
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
