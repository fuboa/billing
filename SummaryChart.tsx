
import React, { useMemo } from 'react';
import { Transaction, Category } from '../types.ts';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SummaryChartProps {
  transactions: Transaction[];
}

const COLORS: Record<Category, string> = {
    [Category.Food]: '#FF6384',
    [Category.Transport]: '#36A2EB',
    [Category.Shopping]: '#FFCE56',
    [Category.Entertainment]: '#4BC0C0',
    [Category.Bills]: '#9966FF',
    [Category.Health]: '#FF9F40',
    [Category.Other]: '#C9CBCF'
};


const SummaryChart: React.FC<SummaryChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const categoryTotals = transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<Category, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name: name as Category,
      value,
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);
  
  if(chartData.length === 0) return null;

  return (
    <div className="mt-6 h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SummaryChart;