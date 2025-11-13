export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'attendant' | 'admin';
  commission?: number; // Porcentagem de comissão (ex: 5 para 5%)
}

export interface Sale {
  id: string;
  clientName: string;
  clientPhone: string;
  value: number;
  date: string; // YYYY-MM-DD
  attendantName: string;
  attendantId: string;
  paymentMethod: 'boleto' | 'pix' | 'cartao'; // Forma de pagamento
}