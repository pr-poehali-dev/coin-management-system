import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { User, ADMIN_PASSWORD } from '@/types';
import { useToast } from '@/hooks/use-toast';

type LoginFormProps = {
  users: User[];
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User) => void;
  setIsAuthenticated: (value: boolean) => void;
};

export default function LoginForm({ users, setUsers, setCurrentUser, setIsAuthenticated }: LoginFormProps) {
  const { toast } = useToast();
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
