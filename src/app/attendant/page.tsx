'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getSales } from '@/lib/storage';
import { Sale } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp, ShoppingBag, DollarSign, Filter, Calendar, User, Percent, Plus, LogOut, CalendarDays } from 'lucide-react';

export default function AttendantPage() {
  const [user, setUser] = useState<any>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all-months');
  const [selectedYear, setSelectedYear] = useState('all-years');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'attendant') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    const userSales = getSales().filter(sale => sale.attendantId === currentUser.id);
    setSales(userSales);
    setFilteredSales(userSales);
  }, [router]);

  useEffect(() => {
    let filtered = sales;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.clientPhone.includes(searchTerm) ||
        new Date(sale.date).toLocaleDateString('pt-BR').includes(searchTerm) ||
        sale.value.toString().includes(searchTerm)
      );
    }

    // Filtro por ano
    if (selectedYear && selectedYear !== 'all-years') {
      filtered = filtered.filter(sale => 
        new Date(sale.date).getFullYear().toString() === selectedYear
      );
    }

    // Filtro por mês
    if (selectedMonth && selectedMonth !== 'all-months') {
      filtered = filtered.filter(sale => 
        (new Date(sale.date).getMonth() + 1).toString().padStart(2, '0') === selectedMonth
      );
    }

    // Filtro por período de datas (calendário)
    if (filterDateFrom) {
      filtered = filtered.filter(sale => new Date(sale.date) >= new Date(filterDateFrom));
    }
    if (filterDateTo) {
      filtered = filtered.filter(sale => new Date(sale.date) <= new Date(filterDateTo));
    }

    setFilteredSales(filtered);
  }, [searchTerm, selectedMonth, selectedYear, filterDateFrom, filterDateTo, sales]);

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('currentUser');
      router.push('/');
    }
  };

  const handleNovaVenda = () => {
    router.push('/nova-venda');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMonth('all-months');
    setSelectedYear('all-years');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'boleto': return 'Boleto';
      case 'pix': return 'PIX';
      case 'cartao': return 'Cartão de Crédito';
      default: return method;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'boleto': return 'bg-orange-100 text-orange-800';
      case 'pix': return 'bg-green-100 text-green-800';
      case 'cartao': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalValue = filteredSales.reduce((sum, sale) => sum + sale.value, 0);
  const totalCount = filteredSales.length;
  const commissionRate = user?.commission || 0;
  const totalCommission = (totalValue * commissionRate) / 100;

  // Obter anos únicos das vendas
  const availableYears = [...new Set(sales.map(sale => 
    new Date(sale.date).getFullYear().toString()
  ))].sort((a, b) => b.localeCompare(a));

  // Meses para seleção
  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/d1a9b679-9387-4997-a6bc-e37ddd54dc0b.png" 
                alt="Fyvo Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Painel de Vendas da Equipe
                </h1>
                <p className="text-gray-600 text-lg">Bem-vindo, {user.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleNovaVenda}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Venda
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Número de Vendas</CardTitle>
              <ShoppingBag className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão ({commissionRate}%)</CardTitle>
              <Percent className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {totalCommission.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                R$ {totalCount > 0 ? (totalValue / totalCount).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 shadow-lg cursor-default">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Search className="h-5 w-5" />
              Busca Inteligente e Filtros
            </CardTitle>
            <CardDescription>Pesquise e filtre suas vendas por múltiplos critérios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, telefone, data ou valor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 cursor-text"
              />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Calendar className="h-4 w-4" />
                  Ano
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Todos os anos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-years" className="cursor-pointer">Todos os anos</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year} className="cursor-pointer">{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Calendar className="h-4 w-4" />
                  Mês
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-months" className="cursor-pointer">Todos os meses</SelectItem>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value} className="cursor-pointer">
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <CalendarDays className="h-4 w-4" />
                  Data Inicial
                </Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <CalendarDays className="h-4 w-4" />
                  Data Final
                </Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Filter className="h-4 w-4" />
                  Ações
                </Label>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full cursor-pointer"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Contador de Resultados e Indicador de Período */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {filteredSales.length} {filteredSales.length === 1 ? 'venda encontrada' : 'vendas encontradas'}
              </span>
              <div className="flex flex-wrap gap-2">
                {(searchTerm || (selectedMonth && selectedMonth !== 'all-months') || (selectedYear && selectedYear !== 'all-years') || filterDateFrom || filterDateTo) && (
                  <span className="text-blue-600 font-medium">
                    Filtros ativos
                  </span>
                )}
                {(filterDateFrom || filterDateTo) && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-100 px-2 py-1 rounded cursor-default">
                    <CalendarDays className="h-3 w-3" />
                    <span className="text-xs">
                      {filterDateFrom ? new Date(filterDateFrom).toLocaleDateString('pt-BR') : 'Início'} até {filterDateTo ? new Date(filterDateTo).toLocaleDateString('pt-BR') : 'Fim'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg cursor-default">
          <CardHeader>
            <CardTitle className="text-blue-600">Suas Vendas</CardTitle>
            <CardDescription>
              {filteredSales.length} {filteredSales.length === 1 ? 'venda' : 'vendas'} • 
              Total: R$ {totalValue.toFixed(2)} • 
              Comissão: R$ {totalCommission.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((sale) => {
                      const saleCommission = (sale.value * commissionRate) / 100;
                      return (
                        <TableRow key={sale.id} className="hover:bg-gray-50 cursor-default">
                          <TableCell className="font-medium">
                            {new Date(sale.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>{sale.clientName}</TableCell>
                          <TableCell>{sale.clientPhone}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(sale.paymentMethod || '')}`}>
                              {getPaymentMethodLabel(sale.paymentMethod || '')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            R$ {sale.value.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-orange-600">
                            R$ {saleCommission.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <ShoppingBag className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm || (selectedMonth && selectedMonth !== 'all-months') || (selectedYear && selectedYear !== 'all-years') || filterDateFrom || filterDateTo ? 'Nenhuma venda encontrada' : 'Nenhuma venda cadastrada'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || (selectedMonth && selectedMonth !== 'all-months') || (selectedYear && selectedYear !== 'all-years') || filterDateFrom || filterDateTo
                    ? 'Tente ajustar os filtros ou termos de busca'
                    : 'Cadastre sua primeira venda para começar!'
                  }
                </p>
                {!searchTerm && selectedMonth === 'all-months' && selectedYear === 'all-years' && !filterDateFrom && !filterDateTo && (
                  <Button 
                    onClick={handleNovaVenda}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeira Venda
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}