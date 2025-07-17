
export enum Category {
  Food = '餐饮',
  Transport = '交通',
  Shopping = '购物',
  Entertainment = '娱乐',
  Bills = '账单',
  Health = '健康',
  Other = '其他',
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: string;
}
