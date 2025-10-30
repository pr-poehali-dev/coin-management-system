import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');

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
      const user: User = existingAdmin || { username: 'Sabzara', role: 'Админ', balance: 0, password: ADMIN_PASSWORD };
      if (!existingAdmin) {
        setUsers([...users, user]);
      }
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы вошли как администратор',
      });
    } else {
      const existingUser = users.find(u => u.username === loginUsername);
      if (existingUser && existingUser.password === loginPassword) {
        setCurrentUser(existingUser);
        setIsAuthenticated(true);
        toast({
          title: 'Добро пожаловать!',
          description: `Вы вошли как ${existingUser.role.toLowerCase()}`,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Неверное имя пользователя или пароль',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRegister = () => {
    if (!registerUsername || !registerPassword || !registerPasswordConfirm) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    if (registerPassword !== registerPasswordConfirm) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    if (registerPassword.length < 4) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 4 символов',
        variant: 'destructive',
      });
      return;
    }

    if (users.find(u => u.username === registerUsername)) {
      toast({
        title: 'Ошибка',
        description: 'Пользователь с таким именем уже существует',
        variant: 'destructive',
      });
      return;
    }

    const newUser: User = {
      username: registerUsername,
      password: registerPassword,
      role: 'Пользователь',
      balance: 0,
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    toast({
      title: 'Регистрация успешна!',
      description: 'Добро пожаловать в систему',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl animate-fade-in">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-2">
            <Icon name="Coins" size={32} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Мониторинг валют</CardTitle>
          <CardDescription>Войдите или зарегистрируйтесь</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Имя пользователя</Label>
                <Input
                  id="login-username"
                  placeholder="Введите имя"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Пароль</Label>
                <Input
                  id="login-password"
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
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Имя пользователя</Label>
                <Input
                  id="register-username"
                  placeholder="Придумайте имя"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Придумайте пароль"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password-confirm">Подтверждение пароля</Label>
                <Input
                  id="register-password-confirm"
                  type="password"
                  placeholder="Повторите пароль"
                  value={registerPasswordConfirm}
                  onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>
              <Button onClick={handleRegister} className="w-full h-11 text-base font-semibold">
                Зарегистрироваться
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}