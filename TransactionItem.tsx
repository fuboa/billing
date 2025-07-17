
import React from 'react';
import { Transaction, Category } from '../types.ts';
import { Utensils, Bus, ShoppingCart, Clapperboard, Receipt, Stethoscope, Package, Trash2 } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const categoryIcons: Record<Category, React.ReactNode> = {
  [Category.Food]: <Utensils size={24} />,
  [Category.Transport]: <Bus size={24} />,
  [Category.Shopping]: <ShoppingCart size={24} />,
  [Category.Entertainment]: <Clapperboard size={24} />,
  [Category.Bills]: <Receipt size={24} />,
  [Category.Health]: <Stethoscope size={24} />,
  [Category.Other]: <Package size={24} />,
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(window.confirm(`确定要删除这笔 "${transaction.description}" 的记录吗?`)) {
            onDelete(transaction.id);
        }
    }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-wechat-border flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="bg-wechat-bg p-3 rounded-full text-wechat-text-primary">
          {categoryIcons[transaction.category]}
        </div>
        <div>
          <p className="font-medium text-wechat-text-primary">{transaction.description}</p>
          <p className="text-sm text-wechat-text-secondary">{transaction.category} · {new Date(transaction.date).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <p className="font-bold text-wechat-text-primary text-lg">-¥{transaction.amount.toFixed(2)}</p>
        <button onClick={handleDelete} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
            <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;