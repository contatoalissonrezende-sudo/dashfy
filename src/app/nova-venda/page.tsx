'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, saveSale } from '@/lib/storage';
import { Sale } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CreditCard, User, Phone, DollarSign, Calendar, CheckCircle } from 'lucide-react';

export default function NovaVendaPage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || (currentUser.role !== 'attendant' && currentUser.role !== 'admin')) {
      router.push('/');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paymentMethod) {
      alert('Por favor, selecione a forma de pagamento.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newSale: Sale = {
        id: Date.now().toString(),
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        value: parseFloat(formData.value),
        date: formData.date,
        attendantName: user.name,
        attendantId: user.id,
        paymentMethod: formData.paymentMethod as 'boleto' | 'pix' | 'cartao',
      };
      
      saveSale(newSale);
      
      // Mostrar sucesso
      setShowSuccess(true);
      
      // Limpar formulário
      setFormData({
        clientName: '',
        clientPhone: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '',
      });

      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      alert('Erro ao salvar a venda. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (user?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/attendant');
    }
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Cadastrar Nova Venda</h1>
              <p className="text-gray-600">Registre uma nova venda no sistema</p>
            </div>
          </div>
        </header>

        {/* Mensagem de Sucesso */}
        {showSuccess && (
          <Card className="mb-6 border-green-200 bg-green-50 cursor-default">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Venda cadastrada com sucesso!</p>
                  <p className="text-sm text-green-600">A venda foi registrada no sistema.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Nova Venda */}
        <Card className="cursor-default">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados da Venda
            </CardTitle>
            <CardDescription>
              Preencha todos os campos para registrar a venda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="cursor-pointer">Nome do Cliente</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    placeholder="Digite o nome completo"
                    required
                    className="cursor-text"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientPhone" className="cursor-pointer">Telefone</Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    required
                    className="cursor-text"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="value" className="cursor-pointer">Valor da Venda (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="0,00"
                    required
                    className="cursor-text"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="cursor-pointer">Data da Venda</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    className="cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="cursor-pointer">Forma de Pagamento</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto" className="cursor-pointer">Boleto</SelectItem>
                    <SelectItem value="pix" className="cursor-pointer">PIX</SelectItem>
                    <SelectItem value="cartao" className="cursor-pointer">Cartão de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleGoBack}
                  className="flex-1 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Venda'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações do Atendente */}
        <Card className="mt-6 cursor-default">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Atendente: <strong>{user.name}</strong></span>
              {user.commission && (
                <span>Comissão: <strong>{user.commission}%</strong></span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}