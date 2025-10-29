import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { User, Currency } from '@/types';

type UsersTabProps = {
  users: User[];
  currentUser: User | null;
  canManageCoins: boolean;
  isAdmin: boolean;
  activeCurrencyData: Currency;
  convertPrice: (price: number) => number;
  handleAddUser: () => void;
  handleDeleteUser: (username: string) => void;
  handleChangeUserRole: (username: string, newRole: 'Админ' | 'Модер' | 'Пользователь') => void;
  handleGiveBalance: () => void;
  newUserData: { username: string; role: 'Админ' | 'Модер' | 'Пользователь' };
  setNewUserData: (data: { username: string; role: 'Админ' | 'Модер' | 'Пользователь' }) => void;
  addUserDialogOpen: boolean;
  setAddUserDialogOpen: (open: boolean) => void;
  giveBalanceDialogOpen: boolean;
  setGiveBalanceDialogOpen: (open: boolean) => void;
  selectedUserForBalance: User | null;
  setSelectedUserForBalance: (user: User | null) => void;
  balanceAmount: string;
  setBalanceAmount: (amount: string) => void;
};

export default function UsersTab({
  users,
  currentUser,
  canManageCoins,
  isAdmin,
  activeCurrencyData,
  convertPrice,
  handleAddUser,
  handleDeleteUser,
  handleChangeUserRole,
  handleGiveBalance,
  newUserData,
  setNewUserData,
  addUserDialogOpen,
  setAddUserDialogOpen,
  giveBalanceDialogOpen,
  setGiveBalanceDialogOpen,
  selectedUserForBalance,
  setSelectedUserForBalance,
  balanceAmount,
  setBalanceAmount,
}: UsersTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
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
            </>
          )}
        </div>
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
    </div>
  );
}
