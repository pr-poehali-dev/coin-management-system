import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { Settings, Currency } from '@/types';

type SettingsTabProps = {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  handleAddCurrency: (code: string, symbol: string, rate: string) => void;
  handleDeleteCurrency: (code: string) => void;
  canManageCoins: boolean;
};

export default function SettingsTab({
  settings,
  setSettings,
  handleAddCurrency,
  handleDeleteCurrency,
  canManageCoins,
}: SettingsTabProps) {
  const [newCurrencyCode, setNewCurrencyCode] = useState('');
  const [newCurrencySymbol, setNewCurrencySymbol] = useState('');
  const [newCurrencyRate, setNewCurrencyRate] = useState('');

  const handleAddCurrencyClick = () => {
    if (newCurrencyCode && newCurrencySymbol && newCurrencyRate) {
      handleAddCurrency(newCurrencyCode, newCurrencySymbol, newCurrencyRate);
      setNewCurrencyCode('');
      setNewCurrencySymbol('');
      setNewCurrencyRate('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
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

          <div className="border-t pt-4 space-y-3">
            <Label>Добавить новую валюту</Label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Код (USD)"
                value={newCurrencyCode}
                onChange={(e) => setNewCurrencyCode(e.target.value)}
              />
              <Input
                placeholder="Символ ($)"
                value={newCurrencySymbol}
                onChange={(e) => setNewCurrencySymbol(e.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Курс (1.0)"
                value={newCurrencyRate}
                onChange={(e) => setNewCurrencyRate(e.target.value)}
              />
            </div>
            <Button onClick={handleAddCurrencyClick} className="w-full">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить валюту
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
