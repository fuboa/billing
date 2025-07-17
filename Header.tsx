import React from 'react';

interface HeaderProps {
  activeTab: 'ledger' | 'analysis';
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const title = activeTab === 'ledger' ? '微信记账本' : '消费分析';
  return (
    <header className="bg-wechat-bg border-b border-wechat-border sticky top-0 z-10">
      <div className="h-14 flex items-center justify-center relative">
        <h1 className="text-lg font-semibold text-wechat-text-primary">{title}</h1>
      </div>
    </header>
  );
};

export default Header;