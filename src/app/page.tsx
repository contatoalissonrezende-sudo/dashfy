'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateUser, setCurrentUser } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart3, Users, TrendingUp, Shield, Star, CheckCircle, DollarSign, Calendar, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticateUser(email, password);
    if (user) {
      setCurrentUser(user);
      setIsLoginOpen(false);
      router.push(user.role === 'admin' ? '/admin' : '/attendant');
    } else {
      setError('Credenciais inválidas');
    }
  };

  // Dados dos gráficos
  const salesData = [
    { month: 'Jan', vendas: 45000, meta: 50000, clientes: 120 },
    { month: 'Fev', vendas: 52000, meta: 50000, clientes: 135 },
    { month: 'Mar', vendas: 48000, meta: 55000, clientes: 128 },
    { month: 'Abr', vendas: 61000, meta: 55000, clientes: 145 },
    { month: 'Mai', vendas: 55000, meta: 60000, clientes: 140 },
    { month: 'Jun', vendas: 67000, meta: 60000, clientes: 158 },
    { month: 'Jul', vendas: 71000, meta: 65000, clientes: 165 },
    { month: 'Ago', vendas: 69000, meta: 65000, clientes: 162 },
    { month: 'Set', vendas: 75000, meta: 70000, clientes: 175 },
    { month: 'Out', vendas: 82000, meta: 70000, clientes: 185 },
    { month: 'Nov', vendas: 78000, meta: 75000, clientes: 180 },
    { month: 'Dez', vendas: 89000, meta: 80000, clientes: 195 }
  ];

  const categoryData = [
    { name: 'Eletrônicos', value: 35, color: '#3B82F6' },
    { name: 'Roupas', value: 25, color: '#10B981' },
    { name: 'Casa & Jardim', value: 20, color: '#F59E0B' },
    { name: 'Esportes', value: 12, color: '#EF4444' },
    { name: 'Outros', value: 8, color: '#8B5CF6' }
  ];

  const dailySalesData = [
    { day: 'Seg', vendas: 12000 },
    { day: 'Ter', vendas: 15000 },
    { day: 'Qua', vendas: 18000 },
    { day: 'Qui', vendas: 14000 },
    { day: 'Sex', vendas: 22000 },
    { day: 'Sáb', vendas: 25000 },
    { day: 'Dom', vendas: 16000 }
  ];

  const performanceData = [
    { vendedor: 'Ana Silva', vendas: 45, meta: 40 },
    { vendedor: 'João Santos', vendas: 38, meta: 35 },
    { vendedor: 'Maria Costa', vendas: 42, meta: 40 },
    { vendedor: 'Pedro Lima', vendas: 35, meta: 30 },
    { vendedor: 'Carla Souza', vendas: 48, meta: 45 }
  ];

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Relatórios Avançados",
      description: "Visualize suas vendas com gráficos detalhados e métricas em tempo real"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Gestão de Equipe",
      description: "Gerencie sua equipe de vendas e acompanhe o desempenho individual"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: "Análise de Performance",
      description: "Identifique tendências e oportunidades de crescimento"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Segurança Total",
      description: "Seus dados protegidos com autenticação segura e controle de acesso"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Gerente de Vendas",
      content: "O sistema revolucionou nossa gestão de vendas. Agora temos controle total sobre nossa equipe.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Diretor Comercial",
      content: "Relatórios claros e intuitivos que nos ajudam a tomar decisões estratégicas rapidamente.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Coordenadora",
      content: "Interface simples e funcional. Nossa produtividade aumentou significativamente.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">SalesManager Pro</h1>
            </div>
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                  Acessar Sistema
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center text-blue-600">Login do Sistema</DialogTitle>
                  <DialogDescription className="text-center">
                    Entre com suas credenciais para acessar o painel
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="cursor-pointer">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="cursor-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="cursor-pointer">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="cursor-text"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer">
                    Entrar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gerencie suas <span className="text-blue-600">Vendas</span> com Inteligência
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema completo para controle de vendas, gestão de equipe e análise de performance. 
              Transforme dados em resultados com nossa plataforma intuitiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 cursor-pointer">
                    Começar Agora
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 cursor-pointer">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard de Vendas - Seção Principal */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dashboard de Vendas em Tempo Real
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Visualize o desempenho completo das suas vendas com gráficos interativos e métricas detalhadas
            </p>
          </div>

          {/* KPIs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="cursor-default">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vendas do Mês</p>
                    <p className="text-2xl font-bold text-gray-900">R$ 89.000</p>
                    <p className="text-sm text-green-600">+12% vs mês anterior</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-default">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">195</p>
                    <p className="text-sm text-green-600">+8% vs mês anterior</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-default">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Meta Atingida</p>
                    <p className="text-2xl font-bold text-gray-900">111%</p>
                    <p className="text-sm text-green-600">Acima da meta</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-default">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-gray-900">R$ 456</p>
                    <p className="text-sm text-green-600">+5% vs mês anterior</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Gráfico de Vendas Mensais */}
            <Card className="cursor-default">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Vendas vs Meta - 2024</CardTitle>
                <CardDescription>Comparativo mensal de vendas realizadas e metas estabelecidas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="vendas" fill="#3B82F6" name="Vendas Realizadas" />
                    <Bar dataKey="meta" fill="#E5E7EB" name="Meta" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Vendas por Categoria */}
            <Card className="cursor-default">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Vendas por Categoria</CardTitle>
                <CardDescription>Distribuição percentual das vendas por categoria de produto</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Secundários */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Vendas da Semana */}
            <Card className="cursor-default">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Vendas da Semana</CardTitle>
                <CardDescription>Performance diária das vendas na semana atual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Vendas']} />
                    <Area type="monotone" dataKey="vendas" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance da Equipe */}
            <Card className="cursor-default">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Performance da Equipe</CardTitle>
                <CardDescription>Vendas realizadas vs meta individual dos vendedores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="vendedor" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vendas" fill="#3B82F6" name="Vendas" />
                    <Bar dataKey="meta" fill="#E5E7EB" name="Meta" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendência Anual */}
          <Card className="cursor-default mb-12">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Tendência de Crescimento - 2024</CardTitle>
              <CardDescription>Evolução das vendas e aquisição de clientes ao longo do ano</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="vendas" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Vendas (R$)" 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="clientes" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Novos Clientes" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar suas vendas de forma eficiente
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-default">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Empresas Atendidas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-gray-600">Vendas Registradas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Garantido</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Depoimentos reais de quem já transformou suas vendas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="cursor-default">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para revolucionar suas vendas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já transformaram seus resultados
          </p>
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3 cursor-pointer">
                Começar Gratuitamente
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold">SalesManager Pro</span>
              </div>
              <p className="text-gray-400">
                A solução completa para gestão de vendas e equipes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white cursor-pointer">Recursos</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">Preços</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">Demonstração</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white cursor-pointer">Documentação</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">Contato</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white cursor-pointer">Sobre</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">Blog</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">Carreiras</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SalesManager Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}