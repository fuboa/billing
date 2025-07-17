
import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { Transaction } from './types.ts';
import Header from './components/Header.tsx';
import AddTransactionForm from './components/AddTransactionForm.tsx';
import TransactionList from './components/TransactionList.tsx';
import SummaryChart from './components/SummaryChart.tsx';
import BottomNav from './components/BottomNav.tsx';
import AnalysisView from './components/AnalysisView.tsx';
import { Plus } from 'lucide-react';

type Tab = 'ledger' | 'analysis';

const App: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('ledger');

  const handleAddTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setIsFormOpen(false);
  }, [setTransactions]);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const monthlyTotal = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const renderLedgerView = () => (
    <>
      <div className="p-4 bg-gray-50">
         <div className="bg-white p-4 rounded-lg shadow-sm border border-wechat-border">
            <p className="text-wechat-text-secondary text-sm">本月支出</p>
            <p className="text-wechat-text-primary text-3xl font-bold mt-1">
              ¥{monthlyTotal.toFixed(2)}
            </p>
            {transactions.length > 0 && <SummaryChart transactions={transactions} />}
        </div>
      </div>
      <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
    </>
  );

  return (
    <div className="bg-wechat-bg min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md bg-white shadow-lg flex flex-col h-screen">
        <Header activeTab={activeTab} />
        
        <main className="flex-1 overflow-y-auto pb-24">
          {activeTab === 'ledger' ? renderLedgerView() : <AnalysisView transactions={transactions} />}
        </main>

        <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto">
          {activeTab === 'ledger' && (
             <button
                onClick={() => setIsFormOpen(true)}
                className="bg-wechat-green text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-wechat-dark-green transition-colors transform active:scale-95 absolute bottom-20 right-6"
                aria-label="添加一笔"
              >
                <Plus size={28} />
              </button>
          )}
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
      
      <AddTransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
};

export default App;