
import React from 'react';
import { Transaction } from '../types.ts';
import TransactionItem from './TransactionItem.tsx';
import { FileText } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 text-wechat-text-secondary">
        <FileText size={48} className="mx-auto mb-4" />
        <p>暂无记录</p>
        <p className="text-sm">点击右下角按钮添加一笔新账单</p>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-3">
        <h2 className="text-wechat-text-primary font-semibold mt-4">账单明细</h2>
        {transactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} onDelete={onDelete} />
        ))}
    </div>
  );
};

export default TransactionList;