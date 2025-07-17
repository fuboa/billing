import React from 'react';
import { BookText, BarChart3 } from 'lucide-react';

type Tab = 'ledger' | 'analysis';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeColor = 'text-wechat-green';
  const inactiveColor = 'text-wechat-text-secondary';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200 ${isActive ? activeColor : inactiveColor}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white border-t border-wechat-border flex h-16 w-full shadow-inner">
      <NavButton
        label="记账"
        icon={<BookText size={24} />}
        isActive={activeTab === 'ledger'}
        onClick={() => setActiveTab('ledger')}
      />
      <NavButton
        label="分析"
        icon={<BarChart3 size={24} />}
        isActive={activeTab === 'analysis'}
        onClick={() => setActiveTab('analysis')}
      />
    </nav>
  );
};

export default BottomNav;