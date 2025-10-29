import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { User, Currency } from '@/types';

type AppHeaderProps = {
  siteName: string;
  currentUser: User | null;
  activeCurrencyData: Currency;
  convertPrice: (price: number) => number;
  handleLogout: () => void;
};

export default function AppHeader({ siteName, currentUser, activeCurrencyData, convertPrice, handleLogout }: AppHeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">{siteName}</h1>
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
      </div>
    </header>
  );
}
