import { User, Sale } from './types';

const USERS_KEY = 'sales_app_users';
const SALES_KEY = 'sales_app_sales';

// Default users
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    password: '123456',
    role: 'attendant',
    commission: 5, // 5% de comissão
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    password: '123456',
    role: 'attendant',
    commission: 7, // 7% de comissão
  },
  {
    id: 'admin',
    name: 'Administrador',
    email: 'admin@empresa.com',
    password: 'admin123',
    role: 'admin',
  },
];

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return defaultUsers;
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(stored);
};

export const getSales = (): Sale[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SALES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveSale = (sale: Sale): void => {
  const sales = getSales();
  sales.push(sale);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
};

export const deleteSale = (saleId: string): void => {
  const sales = getSales();
  const filteredSales = sales.filter(sale => sale.id !== saleId);
  localStorage.setItem(SALES_KEY, JSON.stringify(filteredSales));
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
};

export const updateUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const updateUserCommission = (userId: string, commission: number): void => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex].commission = commission;
    updateUsers(users);
  }
};

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email && user.password === password) || null;
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('current_user');
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('current_user');
  }
};