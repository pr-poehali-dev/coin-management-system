import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Coin } from '@/types';

type EditCoinDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCoin: Coin | null;
  editCoinData: { value: string; change: string; volume: string };
  setEditCoinData: (data: { value: string; change: string; volume: string }) => void;
  handleSaveEditCoin: () => void;
};

export default function EditCoinDialog({
  open,
  onOpenChange,
  editingCoin,
  editCoinData,
  setEditCoinData,
  handleSaveEditCoin,
}: EditCoinDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать {editingCoin?.name}</DialogTitle>
          <DialogDescription>Измените цену и данные монеты</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-value">Цена ($)</Label>
            <Input
              id="edit-value"
              type="number"
              value={editCoinData.value}
              onChange={(e) => setEditCoinData({ ...editCoinData, value: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-change">Изменение (%)</Label>
            <Input
              id="edit-change"
              type="number"
              step="0.1"
              value={editCoinData.change}
              onChange={(e) => setEditCoinData({ ...editCoinData, change: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-volume">Объём ($)</Label>
            <Input
              id="edit-volume"
              type="number"
              value={editCoinData.volume}
              onChange={(e) => setEditCoinData({ ...editCoinData, volume: e.target.value })}
            />
          </div>
          <Button onClick={handleSaveEditCoin} className="w-full">
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
