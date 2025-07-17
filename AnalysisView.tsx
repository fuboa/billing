
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Transaction, Category } from '../types.ts';
import { TrendingUp, TrendingDown, Minus, Share2, LoaderCircle, Users, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import pako from 'pako';

interface AnalysisViewProps {
  transactions: Transaction[];
}

// --- Helper functions for data sharing ---
function uint8ArrayToBase64(a: Uint8Array): string {
    let b = '';
    for(let i = 0; i < a.length; i++) {
        b += String.fromCharCode(a[i]);
    }
    return window.btoa(b);
}

function base64ToUint8Array(b: string): Uint8Array {
    const s = window.atob(b);
    const a = new Uint8Array(s.length);
    for(let i = 0; i < s.length; i++) {
        a[i] = s.charCodeAt(i);
    }
    return a;
}
// ---

const getDataForPeriod = (transactions: Transaction[], year: number, month: number) => {
  const periodTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === year && tDate.getMonth() === month;
  });

  const total = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const byCategory = periodTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<Category, number>);

  return { transactions: periodTransactions, total, byCategory };
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ transactions }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [friendTransactions, setFriendTransactions] = useState<Transaction[] | null>(null);
  const shareableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const compareData = urlParams.get('compare');
      if (compareData) {
          try {
              const uint8Array = base64ToUint8Array(compareData);
              const decompressed = pako.inflate(uint8Array, { to: 'string' });
              const parsedTransactions: Transaction[] = JSON.parse(decompressed);
              setFriendTransactions(parsedTransactions);
              window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
          } catch (e) {
              console.error("Failed to parse friend's data", e);
              alert("无法加载好友数据，链接可能已损坏。");
          }
      }
  }, []);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const { currentMonthData, previousMonthData } = useMemo(() => {
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const previousMonthYear = prevMonthDate.getFullYear();
    const previousMonth = prevMonthDate.getMonth();

    return {
      currentMonthData: getDataForPeriod(transactions, currentYear, currentMonth),
      previousMonthData: getDataForPeriod(transactions, previousMonthYear, previousMonth),
    };
  }, [transactions, currentYear, currentMonth]);

  const friendCurrentMonthData = useMemo(() => {
      if (!friendTransactions) return null;
      return getDataForPeriod(friendTransactions, currentYear, currentMonth);
  }, [friendTransactions, currentYear, currentMonth]);

  const difference = currentMonthData.total - previousMonthData.total;
  const percentageChange = previousMonthData.total > 0
    ? (difference / previousMonthData.total) * 100
    : currentMonthData.total > 0 ? 100 : 0;
  
  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="text-red-500" />;
    if (value < 0) return <TrendingDown className="text-green-500" />;
    return <Minus className="text-gray-500" />;
  }
  
  const allCategories = useMemo(() => {
    const cats = new Set<Category>(Object.keys(currentMonthData.byCategory) as Category[]);
    Object.keys(previousMonthData.byCategory).forEach(c => cats.add(c as Category));
    return Array.from(cats).sort();
  }, [currentMonthData.byCategory, previousMonthData.byCategory]);

  const handleShare = async () => {
    if (!shareableRef.current || !navigator.share) {
      alert('分享功能在此浏览器上不可用。');
      return;
    }
    
    setIsSharing(true);
    try {
        const canvas = await html2canvas(shareableRef.current, { 
            useCORS: true,
            backgroundColor: '#f7f7f7',
            scale: 2 
        });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        
        if (!blob) throw new Error('无法生成图片。');

        const file = new File([blob], 'expense-analysis.png', { type: 'image/png' });
        const shareData = {
            title: '我的消费分析',
            text: `来看看我的本月消费分析报告！`,
            files: [file],
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
             throw new Error('无法分享此内容。');
        }
    } catch (error) {
        if ((error as Error).name !== 'AbortError') {
            console.error('分享失败:', error);
            alert(`分享失败: ${(error as Error).message}`);
        }
    } finally {
        setIsSharing(false);
    }
  };

  const handleInviteFriend = async () => {
    if (transactions.length === 0) {
      alert("你还没有任何账单可以分享对比哦。");
      return;
    }
    setIsInviting(true);
    try {
      const jsonString = JSON.stringify(transactions);
      const compressed = pako.deflate(jsonString);
      const base64String = uint8ArrayToBase64(compressed);
      
      const url = new URL(window.location.href);
      url.search = `?compare=${encodeURIComponent(base64String)}`;
      
      await navigator.share({
        title: '消费对比邀请',
        text: '快来看看我们的消费习惯有什么不同！',
        url: url.toString()
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error("创建邀请链接失败:", error);
        alert("创建邀请链接失败。");
      }
    } finally {
      setIsInviting(false);
    }
  };
  
  if (friendTransactions && friendCurrentMonthData) {
    const myData = currentMonthData;
    const friendData = friendCurrentMonthData;
    const combinedCategories = Array.from(new Set([...Object.keys(myData.byCategory), ...Object.keys(friendData.byCategory)])).sort() as Category[];

    return (
        <div className="p-4 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-wechat-border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-wechat-text-primary">好友消费对比</h2>
                    <button
                        onClick={() => setFriendTransactions(null)}
                        className="flex items-center text-sm bg-gray-200 text-wechat-text-primary px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        <X size={16} className="mr-1" />
                        退出对比
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center border-b pb-4">
                    <div>
                        <p className="text-sm text-wechat-text-secondary">我的支出</p>
                        <p className="text-2xl font-bold text-wechat-text-primary mt-1">¥{myData.total.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-wechat-text-secondary">好友支出</p>
                        <p className="text-2xl font-bold text-wechat-text-primary mt-1">¥{friendData.total.toFixed(2)}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="text-md font-semibold text-wechat-text-primary mb-2 text-center">分类对比 (本月)</h3>
                    <div className="space-y-1">
                        {combinedCategories.map(category => {
                            const myAmount = myData.byCategory[category] || 0;
                            const friendAmount = friendData.byCategory[category] || 0;
                            return (
                                <div key={category} className="grid grid-cols-3 items-center text-sm p-2 rounded-md hover:bg-gray-50">
                                    <span className="text-wechat-text-primary font-medium">{category}</span>
                                    <span className="text-wechat-text-secondary text-right font-mono">¥{myAmount.toFixed(2)}</span>
                                    <span className="text-wechat-text-primary text-right font-mono">¥{friendAmount.toFixed(2)}</span>
                                </div>
                            );
                        })}
                        <div className="grid grid-cols-3 items-center text-sm font-bold border-t pt-3 mt-3 p-2">
                             <span className="text-wechat-text-primary">总计</span>
                             <span className="text-wechat-text-secondary text-right font-mono">¥{myData.total.toFixed(2)}</span>
                             <span className="text-wechat-text-primary text-right font-mono">¥{friendData.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div ref={shareableRef} className="space-y-6 bg-wechat-bg p-4 rounded-lg">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-wechat-border">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-wechat-text-primary">月度总览</h2>
              <div className="flex items-center space-x-2">
                <button
                    onClick={handleInviteFriend}
                    disabled={isInviting || transactions.length === 0}
                    className="flex items-center text-sm bg-wechat-green/10 text-wechat-green px-3 py-1.5 rounded-lg hover:bg-wechat-green/20 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-white"
                >
                    {isInviting ? <LoaderCircle size={16} className="animate-spin" /> : <Users size={16} />}
                    <span className="ml-2">与好友对比</span>
                </button>
                <button
                    onClick={handleShare}
                    disabled={isSharing || transactions.length === 0}
                    className="flex items-center text-sm bg-wechat-green text-white px-3 py-1.5 rounded-lg hover:bg-wechat-dark-green transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {isSharing ? <LoaderCircle size={16} className="animate-spin mr-2" /> : <Share2 size={16} className="mr-2" />}
                    分享
                </button>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-wechat-text-secondary">本月支出</p>
              <p className="text-2xl font-bold text-wechat-text-primary mt-1">¥{currentMonthData.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-wechat-text-secondary">上月支出</p>
              <p className="text-2xl font-bold text-wechat-text-primary mt-1">¥{previousMonthData.total.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center text-sm text-wechat-text-secondary space-x-2">
              {getChangeIcon(difference)}
              <span>
                  {percentageChange !== 0 ? `环比${percentageChange > 0 ? '增加' : '减少'} ${Math.abs(percentageChange).toFixed(1)}%` : '与上月持平'}
              </span>
          </div>
        </div>
        
        {allCategories.length > 0 && (
           <div className="bg-white p-4 rounded-lg shadow-sm border border-wechat-border">
              <h2 className="text-lg font-semibold text-wechat-text-primary mb-4">分类对比</h2>
               <div className="flex justify-between items-center text-xs text-wechat-text-secondary font-bold mb-2 px-2">
                  <span>分类</span>
                  <div className="flex items-center space-x-2 text-right">
                  <span className="w-20">上月</span>
                  <span className="w-20">本月</span>
                  <span className="w-24">变化</span>
                  </div>
              </div>
              <div className="space-y-1">
                {allCategories.map(category => {
                  const currentAmount = currentMonthData.byCategory[category] || 0;
                  const prevAmount = previousMonthData.byCategory[category] || 0;
                  const catDiff = currentAmount - prevAmount;

                  return (
                    <div key={category} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50">
                      <span className="text-wechat-text-primary font-medium">{category}</span>
                      <div className="flex items-center space-x-2 text-right font-mono">
                         <span className="text-wechat-text-secondary w-20">¥{prevAmount.toFixed(2)}</span>
                         <span className="text-wechat-text-primary w-20">¥{currentAmount.toFixed(2)}</span>
                         <span className={`w-24 font-sans ${catDiff > 0 ? 'text-red-500' : catDiff < 0 ? 'text-green-500' : 'text-wechat-text-secondary'}`}>
                           {catDiff !== 0 ? `${catDiff > 0 ? '↑' : '↓'} ¥${Math.abs(catDiff).toFixed(2)}` : '-'}
                         </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between items-center text-sm font-bold border-t pt-3 mt-3 px-2">
                   <span className="text-wechat-text-primary">总计</span>
                   <div className="flex items-center space-x-2 text-right font-mono">
                      <span className="text-wechat-text-secondary w-20">¥{previousMonthData.total.toFixed(2)}</span>
                      <span className="text-wechat-text-primary w-20">¥{currentMonthData.total.toFixed(2)}</span>
                      <span className={`w-24 font-sans ${difference > 0 ? 'text-red-500' : difference < 0 ? 'text-green-500' : 'text-wechat-text-secondary'}`}>
                         {difference !== 0 ? `${difference > 0 ? '↑' : '↓'} ¥${Math.abs(difference).toFixed(2)}` : '-'}
                      </span>
                   </div>
                </div>
           </div>
         )}
      </div>

       {transactions.length === 0 && !friendTransactions && (
         <div className="text-center py-16 text-wechat-text-secondary">
           <p>暂无数据</p>
           <p className="text-sm">请先在“记账”页面添加一些记录</p>
         </div>
       )}
    </div>
  );
};

export default AnalysisView;