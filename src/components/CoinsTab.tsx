import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { Coin, Currency } from '@/types';

type CoinsTabProps = {
  coins: Coin[];
  canManageCoins: boolean;
  activeCurrencyData: Currency;
  convertPrice: (price: number) => number;
  handleAddCoin: () => void;
  handleEditCoin: (coin: Coin) => void;
  handleDeleteCoin: (coinId: string) => void;
  newCoin: { name: string; symbol: string; value: string; volume: string };
  setNewCoin: (coin: { name: string; symbol: string; value: string; volume: string }) => void;
  addCoinDialogOpen: boolean;
  setAddCoinDialogOpen: (open: boolean) => void;
};

export default function CoinsTab({
  coins,
  canManageCoins,
  activeCurrencyData,
  convertPrice,
  handleAddCoin,
  handleEditCoin,
  handleDeleteCoin,
  newCoin,
  setNewCoin,
  addCoinDialogOpen,
  setAddCoinDialogOpen,
}: CoinsTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
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
                    placeholder="50000"
                    value={newCoin.value}
                    onChange={(e) => setNewCoin({ ...newCoin, value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coin-volume">Объём ($)</Label>
                  <Input
                    id="coin-volume"
                    type="number"
                    placeholder="1000000000"
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

      <div className="grid gap-4">
        {coins.map((coin) => (
          <Card key={coin.id} className="border-border/50">
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
                  <p className="text-2xl font-bold">{activeCurrencyData.symbol}{convertPrice(coin.value).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                  <p className={`text-sm font-semibold ${coin.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {coin.change > 0 ? '+' : ''}{coin.change}%
                  </p>
                </div>
                <div className="text-right text-muted-foreground">
                  <p className="text-sm">Объём 24ч</p>
                  <p className="font-semibold">{activeCurrencyData.symbol}{(convertPrice(coin.volume) / 1e9).toFixed(2)}B</p>
                </div>
                {canManageCoins && (
                  <div className="flex items-center gap-2">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
