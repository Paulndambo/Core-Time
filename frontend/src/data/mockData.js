import { v4 as uuidv4 } from 'uuid';
import { subDays, format } from 'date-fns';

export const mockTransactions = Array.from({ length: 20 }).map((_, i) => ({
    id: uuidv4(),
    date: subDays(new Date(), i),
    description: i % 3 === 0 ? 'Grocery Shopping' : i % 3 === 1 ? 'Salary Deposit' : 'Utility Bill',
    amount: i % 3 === 1 ? 2500 : -(Math.floor(Math.random() * 100) + 50),
    type: i % 3 === 1 ? 'income' : 'expense',
    category: i % 3 === 0 ? 'Food' : i % 3 === 1 ? 'Job' : 'Utilities',
}));
