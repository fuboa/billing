
import React, { useState, useEffect } from 'react';
import { Transaction, Category } from '../types.ts';
import { X } from 'lucide-react';

interface AddTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.Food);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when opened
      setAmount('');
      setDescription('');
      setCategory(Category.Food);
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      setError('金额和说明不能为空');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('请输入有效的正数金额');
      return;
    }

    onSubmit({
      amount: parsedAmount,
      description,
      category,
      date,
    });
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end"
        onClick={onClose}
    >
      <div 
        className={`bg-white w-full rounded-t-2xl p-6 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-wechat-text-primary">记一笔</h2>
          <button onClick={onClose} className="text-wechat-text-secondary p-1">
            <X size={24} />
          </button>
        </div>
        
        {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4 text-sm">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-wechat-text-secondary mb-1">金额</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 border border-wechat-border rounded-lg focus:ring-2 focus:ring-wechat-green focus:border-wechat-green"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-wechat-text-secondary mb-1">说明</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="买了什么..."
              className="w-full p-3 border border-wechat-border rounded-lg focus:ring-2 focus:ring-wechat-green focus:border-wechat-green"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-wechat-text-secondary mb-1">分类</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full p-3 border border-wechat-border rounded-lg bg-white focus:ring-2 focus:ring-wechat-green focus:border-wechat-green"
            >
              {Object.values(Category).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-wechat-text-secondary mb-1">日期</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-wechat-border rounded-lg focus:ring-2 focus:ring-wechat-green focus:border-wechat-green"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-wechat-green text-white font-bold py-3 px-4 rounded-lg hover:bg-wechat-dark-green transition-colors duration-200"
          >
            保存
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionForm;