'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getSales, getUsers, updateUserCommission, updateUsers, deleteSale, deleteUser } from '@/lib/storage';
import { Sale, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Calendar, Users, DollarSign, TrendingUp, Settings, Percent, Edit, UserPlus, Trash2, LogOut, CalendarDays, Plus } from 'lucide-react';

interface MonthlySales {
  month: string;
  year: number;
  monthName: string;
  sales: Sale[];
  totalValue: number;
  totalCount: number;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [attendants, setAttendants] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAttendant, setFilterAttendant] = useState<string>('all-attendants');
  const [filterMonth, setFilterMonth] = useState<string>('all-months');
  const [filterYear, setFilterYear] = useState<string>('all-years');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [editingCommission, setEditingCommission] = useState<{ userId: string; commission: number } | null>(null);
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false);
  const [isCreateAttendantDialogOpen, setIsCreateAttendantDialogOpen] = useState(false);
  const [newAttendant, setNewAttendant] = useState({
    name: '',
    email: '',
    password: '',
    commission: 0
  });
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    const allSales = getSales();
    setSales(allSales);
    setAttendants(getUsers().filter(u => u.role === 'attendant'));
  }, [router]);

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('currentUser');
      router.push('/');
    }
  };

  // Função para obter nome do mês em português
  const getMonthName = (monthNumber: number): string => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[monthNumber - 1];
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'boleto': return 'Boleto';
      case 'pix': return 'PIX';
      case 'cartao': return 'Cartão de Crédito';
      default: return method || 'N/A';
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

  const handleDeleteSale = (saleId: string, clientName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a venda do cliente "${clientName}"? Esta ação não pode ser desfeita.`)) {
      deleteSale(saleId);
      // Atualizar a lista de vendas
      const updatedSales = getSales();
      setSales(updatedSales);
    }
  };

  const handleDeleteAttendant = (attendantId: string, attendantName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o atendente "${attendantName}"? Esta ação não pode ser desfeita e todas as vendas associadas permanecerão no sistema.`)) {
      deleteUser(attendantId);
      // Atualizar a lista de atendentes
      setAttendants(getUsers().filter(u => u.role === 'attendant'));
    }
  };

  // Filtrar e agrupar vendas
  const { filteredSales, monthlySales, availableYears, availableMonths } = useMemo(() => {
    let filtered = sales;

    // Filtro por busca inteligente
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.clientName.toLowerCase().includes(term) ||
        sale.clientPhone.includes(term) ||
        sale.attendantName.toLowerCase().includes(term) ||
        getMonthName(new Date(sale.date).getMonth() + 1).toLowerCase().includes(term)
      );
    }

    // Filtro por atendente
    if (filterAttendant !== 'all-attendants') {
      filtered = filtered.filter(sale => sale.attendantId === filterAttendant);
    }

    // Filtro por ano
    if (filterYear !== 'all-years') {
      filtered = filtered.filter(sale => new Date(sale.date).getFullYear().toString() === filterYear);
    }

    // Filtro por mês
    if (filterMonth !== 'all-months') {
      filtered = filtered.filter(sale => (new Date(sale.date).getMonth() + 1).toString() === filterMonth);
    }

    // Filtro por período de datas (calendário)
    if (filterDateFrom) {
      filtered = filtered.filter(sale => new Date(sale.date) >= new Date(filterDateFrom));
    }
    if (filterDateTo) {
      filtered = filtered.filter(sale => new Date(sale.date) <= new Date(filterDateTo));
    }

    // Agrupar por mês
    const monthlyGroups: { [key: string]: MonthlySales } = {};
    
    filtered.forEach(sale => {
      const date = new Date(sale.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!monthlyGroups[key]) {
        monthlyGroups[key] = {
          month: month.toString().padStart(2, '0'),
          year,
          monthName: getMonthName(month),
          sales: [],
          totalValue: 0,
          totalCount: 0
        };
      }
      
      monthlyGroups[key].sales.push(sale);
      monthlyGroups[key].totalValue += sale.value;
      monthlyGroups[key].totalCount += 1;
    });

    // Ordenar por data (mais recente primeiro)
    const sortedMonthly = Object.values(monthlyGroups).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return parseInt(b.month) - parseInt(a.month);
    });

    // Ordenar vendas dentro de cada mês por data (mais recente primeiro)
    sortedMonthly.forEach(monthly => {
      monthly.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    // Obter anos e meses disponíveis para filtros
    const years = [...new Set(sales.map(sale => new Date(sale.date).getFullYear()))].sort((a, b) => b - a);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: getMonthName(i + 1) }));

    return {
      filteredSales: filtered,
      monthlySales: sortedMonthly,
      availableYears: years,
      availableMonths: months
    };
  }, [sales, searchTerm, filterAttendant, filterMonth, filterYear, filterDateFrom, filterDateTo]);

  const totalValue = filteredSales.reduce((sum, sale) => sum + sale.value, 0);
  const totalCount = filteredSales.length;

  const attendantStats = attendants.map(attendant => {
    const attendantSales = filteredSales.filter(sale => sale.attendantId === attendant.id);
    const totalSalesValue = attendantSales.reduce((sum, sale) => sum + sale.value, 0);
    const commission = attendant.commission || 0;
    const totalCommission = (totalSalesValue * commission) / 100;
    
    return {
      ...attendant,
      totalSales: attendantSales.length,
      totalValue: totalSalesValue,
      totalCommission,
    };
  });

  const handleCommissionUpdate = () => {
    if (editingCommission) {
      updateUserCommission(editingCommission.userId, editingCommission.commission);
      // Atualizar a lista de atendentes
      setAttendants(getUsers().filter(u => u.role === 'attendant'));
      setEditingCommission(null);
      setIsCommissionDialogOpen(false);
    }
  };

  const openCommissionDialog = (attendant: User) => {
    setEditingCommission({
      userId: attendant.id,
      commission: attendant.commission || 0
    });
    setIsCommissionDialogOpen(true);
  };

  const handleCreateAttendant = () => {
    if (!newAttendant.name || !newAttendant.email || !newAttendant.password) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Verificar se o email já existe
    const existingUsers = getUsers();
    if (existingUsers.some(user => user.email === newAttendant.email)) {
      alert('Este email já está sendo usado por outro usuário.');
      return;
    }

    // Criar novo atendente
    const newUser: User = {
      id: Date.now().toString(),
      name: newAttendant.name,
      email: newAttendant.email,
      password: newAttendant.password,
      role: 'attendant',
      commission: newAttendant.commission
    };

    // Adicionar à lista de usuários
    const updatedUsers = [...existingUsers, newUser];
    updateUsers(updatedUsers);

    // Atualizar lista local
    setAttendants(updatedUsers.filter(u => u.role === 'attendant'));

    // Limpar formulário e fechar dialog
    setNewAttendant({ name: '', email: '', password: '', commission: 0 });
    setIsCreateAttendantDialogOpen(false);

    alert('Atendente criado com sucesso!');
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/d1a9b679-9387-4997-a6bc-e37ddd54dc0b.png" 
                alt="Fyvo Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-4xl font-bold text-blue-600 mb-2">Painel de Vendas da Equipe</h1>
                <p className="text-gray-600 text-lg">Painel Administrativo - Análise Completa de Vendas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => router.push('/nova-venda')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Venda
              </Button>
              <Dialog open={isCreateAttendantDialogOpen} onOpenChange={setIsCreateAttendantDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Novo Atendente
                  </Button>
                </DialogTrigger>
              </Dialog>
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

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Número de Vendas</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meses com Vendas</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlySales.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalCount > 0 ? (totalValue / totalCount).toFixed(2) : '0.00'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="mb-8 cursor-default">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Busca Inteligente e Filtros
            </CardTitle>
            <CardDescription>
              Busque por nome do cliente, telefone, atendente ou mês. Use os filtros para refinar os resultados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              <div className="lg:col-span-2 space-y-2">
                <Label htmlFor="search" className="cursor-pointer">Busca Inteligente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Digite nome, telefone, atendente ou mês..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 cursor-text"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="cursor-pointer">Atendente</Label>
                <Select value={filterAttendant} onValueChange={setFilterAttendant}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-attendants" className="cursor-pointer">Todos os atendentes</SelectItem>
                    {attendants.map(attendant => (
                      <SelectItem key={attendant.id} value={attendant.id} className="cursor-pointer">
                        {attendant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="cursor-pointer">Ano</Label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-years" className="cursor-pointer">Todos os anos</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()} className="cursor-pointer">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="cursor-pointer">Mês</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-months" className="cursor-pointer">Todos os meses</SelectItem>
                    {availableMonths.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()} className="cursor-pointer">
                        {month.name}
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
            </div>
            
            {(searchTerm || filterAttendant !== 'all-attendants' || filterMonth !== 'all-months' || filterYear !== 'all-years' || filterDateFrom || filterDateTo) && (
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterAttendant('all-attendants');
                    setFilterMonth('all-months');
                    setFilterYear('all-years');
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                  className="cursor-pointer"
                >
                  Limpar Filtros
                </Button>
                {(filterDateFrom || filterDateTo) && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      Período: {filterDateFrom ? new Date(filterDateFrom).toLocaleDateString('pt-BR') : 'Início'} até {filterDateTo ? new Date(filterDateTo).toLocaleDateString('pt-BR') : 'Fim'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gerenciamento de Comissões */}
        <Card className="mb-8 cursor-default">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gerenciamento de Comissões
            </CardTitle>
            <CardDescription>Configure as comissões dos atendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atendente</TableHead>
                    <TableHead className="text-center">Comissão (%)</TableHead>
                    <TableHead className="text-center">Total de Vendas</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Comissão Total</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendantStats
                    .sort((a, b) => b.totalValue - a.totalValue)
                    .map((attendant) => (
                    <TableRow key={attendant.id} className="hover:bg-gray-50 cursor-default">
                      <TableCell className="font-medium">{attendant.name}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {attendant.commission || 0}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{attendant.totalSales}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        R$ {attendant.totalValue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-orange-600">
                        R$ {attendant.totalCommission.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCommissionDialog(attendant)}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAttendant(attendant.id, attendant.name)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Desempenho dos Atendentes */}
        {attendantStats.length > 0 && (
          <Card className="mb-8 cursor-default">
            <CardHeader>
              <CardTitle>Desempenho dos Atendentes</CardTitle>
              <CardDescription>Baseado nos filtros aplicados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atendente</TableHead>
                      <TableHead className="text-center">Total de Vendas</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendantStats
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .map((attendant) => (
                      <TableRow key={attendant.id} className="hover:bg-gray-50 cursor-default">
                        <TableCell className="font-medium">{attendant.name}</TableCell>
                        <TableCell className="text-center">{attendant.totalSales}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          R$ {attendant.totalValue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {attendant.totalSales > 0 ? (attendant.totalValue / attendant.totalSales).toFixed(2) : '0.00'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendas Agrupadas por Mês */}
        <div className="space-y-6">
          {monthlySales.length === 0 ? (
            <Card className="cursor-default">
              <CardContent className="text-center py-8">
                <p className="text-gray-500 text-lg">Nenhuma venda encontrada com os filtros aplicados.</p>
              </CardContent>
            </Card>
          ) : (
            monthlySales.map((monthly) => (
              <Card key={`${monthly.year}-${monthly.month}`} className="border-l-4 border-l-blue-500 cursor-default">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-blue-700">
                        Vendas de {monthly.monthName} {monthly.year}
                      </CardTitle>
                      <CardDescription>
                        {monthly.totalCount} {monthly.totalCount === 1 ? 'venda' : 'vendas'} realizadas
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-semibold">
                        Total: R$ {monthly.totalValue.toFixed(2)}
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-semibold">
                        Pedidos: {monthly.totalCount}
                      </div>
                      <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg font-semibold">
                        Média: R$ {(monthly.totalValue / monthly.totalCount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Data</TableHead>
                          <TableHead>Atendente</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Pagamento</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthly.sales.map((sale) => (
                          <TableRow key={sale.id} className="hover:bg-gray-50 cursor-default">
                            <TableCell className="font-medium">
                              {new Date(sale.date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {sale.attendantName}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{sale.clientName}</TableCell>
                            <TableCell className="text-gray-600">{sale.clientPhone}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(sale.paymentMethod || '')}`}>
                                {getPaymentMethodLabel(sale.paymentMethod || '')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              R$ {sale.value.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSale(sale.id, sale.clientName)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                                Excluir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog para criar novo atendente */}
        <Dialog open={isCreateAttendantDialogOpen} onOpenChange={setIsCreateAttendantDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Criar Novo Atendente
              </DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo acesso de atendente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="cursor-pointer">Nome Completo *</Label>
                <Input
                  id="name"
                  value={newAttendant.name}
                  onChange={(e) => setNewAttendant(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="cursor-text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="cursor-pointer">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAttendant.email}
                  onChange={(e) => setNewAttendant(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ex: joao@empresa.com"
                  className="cursor-text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="cursor-pointer">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAttendant.password}
                  onChange={(e) => setNewAttendant(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Senha de acesso"
                  className="cursor-text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission" className="cursor-pointer">Comissão (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newAttendant.commission}
                  onChange={(e) => setNewAttendant(prev => ({ ...prev, commission: parseFloat(e.target.value) || 0 }))}
                  placeholder="Ex: 5.5 para 5.5%"
                  className="cursor-text"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateAttendantDialogOpen(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button onClick={handleCreateAttendant} className="bg-green-600 hover:bg-green-700 cursor-pointer">
                Criar Atendente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para editar comissão */}
        <Dialog open={isCommissionDialogOpen} onOpenChange={setIsCommissionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Editar Comissão
              </DialogTitle>
              <DialogDescription>
                Configure a porcentagem de comissão para o atendente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commission" className="cursor-pointer">Comissão (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={editingCommission?.commission || 0}
                  onChange={(e) => setEditingCommission(prev => 
                    prev ? { ...prev, commission: parseFloat(e.target.value) || 0 } : null
                  )}
                  placeholder="Ex: 5.5 para 5.5%"
                  className="cursor-text"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCommissionDialogOpen(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button onClick={handleCommissionUpdate} className="cursor-pointer">
                Salvar Comissão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}