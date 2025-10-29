import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Coin, Currency } from '@/types';

type MonitoringTabProps = {
  coins: Coin[];
  activeCurrencyData: Currency;
  convertPrice: (price: number) => number;
};

export default function MonitoringTab({ coins, activeCurrencyData, convertPrice }: MonitoringTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
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
    </div>
  );
}
