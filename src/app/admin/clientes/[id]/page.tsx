'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    MapPin,
    FileText,
    Package,
    Calendar,
    Building2,
    User,
    DollarSign,
    Clock,
    CreditCard,
    Power,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { clientsService } from '@/services/crud';

export default function ClienteDetalhesPage() {
    const router = useRouter();
    const params = useParams();
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadClient();
        }
    }, [params.id]);

    const loadClient = async () => {
        try {
            setLoading(true);
            const id = Number(params.id);
            if (isNaN(id)) {
                alert('ID de cliente inválido');
                router.push('/admin/clientes');
                return;
            }
            const data = await clientsService.getById(id);
            setClient(data);
        } catch (error) {
            console.error('Error loading client:', error);
            alert('Erro ao carregar detalhes do cliente');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0076FF] border-t-transparent"></div>
                    <p className="text-[#64748B] font-medium">Carregando informações do cliente...</p>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen flex items-center justify-center">
                <Card className="border-0 shadow-xl shadow-red-200/50 max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-red-100 rounded-full mb-4">
                            <AlertCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-[#1A1A1A]">Cliente não encontrado</h2>
                        <p className="text-[#64748B] mb-6">O cliente que você procurou não existe ou foi removido.</p>
                        <Button
                            className="bg-[#0076FF] hover:bg-[#0060D0] text-white rounded-xl shadow-lg"
                            onClick={() => router.push('/admin/clientes')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para Lista de Clientes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calcular estatísticas
    const stats = {
        totalSubscriptions: client.subscriptions?.length || 0,
        activeSubscriptions: client.subscriptions?.filter((s: any) => s.status === 'active').length || 0,
        totalInvoices: client.invoices?.length || 0,
        paidInvoices: client.invoices?.filter((i: any) => i.status === 'paid').length || 0,
        overdueInvoices: client.invoices?.filter((i: any) => i.status === 'overdue').length || 0,
    };

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-[1400px] mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-white border-slate-200 hover:bg-slate-50 rounded-xl mt-1 shadow-sm"
                            onClick={() => router.push('/admin/clientes')}
                        >
                            <ArrowLeft className="h-5 w-5 text-[#64748B]" />
                        </Button>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                                <AvatarFallback className="bg-gradient-to-br from-[#0076FF] to-[#00D4FF] text-white font-bold text-xl">
                                    {getInitials(client.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold text-[#1A1A1A]">{client.name}</h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge
                                        variant="outline"
                                        className={`rounded-full px-3 py-1 font-semibold border-2 ${client.type === 'pf'
                                            ? 'border-purple-300 bg-purple-50 text-purple-700'
                                            : 'border-orange-300 bg-orange-50 text-orange-700'
                                            }`}
                                    >
                                        {client.type === 'pf' ? (
                                            <span className="flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5" />
                                                Pessoa Física
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5">
                                                <Building2 className="h-3.5 w-3.5" />
                                                Pessoa Jurídica
                                            </span>
                                        )}
                                    </Badge>
                                    {client.active ? (
                                        <Badge className="rounded-full px-3 py-1 font-semibold shadow-sm bg-emerald-500 hover:bg-emerald-500 text-white border-0">
                                            <span className="flex items-center gap-1.5">
                                                <Power className="h-3.5 w-3.5" />
                                                Ativo
                                            </span>
                                        </Badge>
                                    ) : (
                                        <Badge className="rounded-full px-3 py-1 font-semibold shadow-sm bg-slate-400 hover:bg-slate-400 text-white border-0">
                                            <span className="flex items-center gap-1.5">
                                                <Power className="h-3.5 w-3.5" />
                                                Inativo
                                            </span>
                                        </Badge>
                                    )}
                                    <span className="text-sm text-[#64748B]">ID: #{client.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        className="bg-[#0076FF] hover:bg-[#0060D0] text-white h-12 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold"
                        onClick={() => router.push(`/admin/clientes/${client.id}/editar`)}
                    >
                        <Edit className="mr-2 h-5 w-5" />
                        Editar Cliente
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl">
                                    <Package className="h-5 w-5 text-[#0076FF]" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.activeSubscriptions}/{stats.totalSubscriptions}</div>
                            <p className="text-sm text-[#64748B] font-medium">Assinaturas Ativas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-emerald-50 rounded-xl">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.paidInvoices}/{stats.totalInvoices}</div>
                            <p className="text-sm text-[#64748B] font-medium">Faturas Pagas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-red-50 rounded-xl">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.overdueInvoices}</div>
                            <p className="text-sm text-[#64748B] font-medium">Faturas Vencidas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-purple-50 rounded-xl">
                                    <Clock className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="text-lg font-bold text-[#1A1A1A] mb-1">
                                {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                            <p className="text-sm text-[#64748B] font-medium">Cliente desde</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs de Informações */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white border-0 shadow-lg shadow-slate-200/50 p-1.5 rounded-xl h-auto gap-2">
                        <TabsTrigger
                            value="overview"
                            className="rounded-xl px-6 py-3 font-semibold text-[#64748B] transition-all data-[state=active]:bg-[#0076FF] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:hover:bg-slate-50"
                        >
                            Informações Gerais
                        </TabsTrigger>
                        <TabsTrigger
                            value="financial"
                            className="rounded-xl px-6 py-3 font-semibold text-[#64748B] transition-all data-[state=active]:bg-[#0076FF] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:hover:bg-slate-50"
                        >
                            Financeiro
                        </TabsTrigger>
                    </TabsList>

                    {/* Aba Visão Geral */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Informações de Contato */}
                            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Mail className="h-5 w-5 text-[#0076FF]" />
                                        Informações de Contato
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-5">
                                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Mail className="h-5 w-5 text-[#0076FF]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-[#64748B] mb-1 uppercase font-semibold">Email</p>
                                            <p className="text-sm text-[#1A1A1A] font-medium break-all">{client.email || 'Não informado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Phone className="h-5 w-5 text-[#0076FF]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-[#64748B] mb-1 uppercase font-semibold">Telefone</p>
                                            <p className="text-sm text-[#1A1A1A] font-medium">{client.phone || 'Não informado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <MapPin className="h-5 w-5 text-[#0076FF]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-[#64748B] mb-1 uppercase font-semibold">Endereço</p>
                                            <p className="text-sm text-[#1A1A1A] font-medium">{client.address || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dados Cadastrais */}
                            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5 text-[#0076FF]" />
                                        Dados Cadastrais
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                        <span className="text-sm text-[#64748B] font-semibold">{client.type === 'pj' ? 'CNPJ' : 'CPF'}</span>
                                        <span className="font-mono text-sm font-bold text-[#1A1A1A]">{client.document || 'Não informado'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                        <span className="text-sm text-[#64748B] font-semibold">ID do Cliente</span>
                                        <Badge variant="outline" className="font-mono font-bold">#{client.id}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                        <span className="text-sm text-[#64748B] font-semibold">Data de Cadastro</span>
                                        <span className="text-sm font-bold text-[#1A1A1A]">
                                            {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                        <span className="text-sm text-[#64748B] font-semibold">Última Atualização</span>
                                        <span className="text-sm font-bold text-[#1A1A1A]">
                                            {new Date(client.updatedAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    {client.users && client.users.length > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                                            <span className="text-sm text-[#64748B] font-semibold">Usuários Vinculados</span>
                                            <Badge className="bg-[#0076FF] hover:bg-[#0076FF] text-white font-bold">
                                                {client.users.length} {client.users.length === 1 ? 'usuário' : 'usuários'}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Observações */}
                        {client.notes && (
                            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5 text-[#0076FF]" />
                                        Observações
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <p className="text-sm text-[#64748B] whitespace-pre-line leading-relaxed">{client.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Aba Financeira */}
                    <TabsContent value="financial" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Assinaturas */}
                            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Package className="h-5 w-5 text-[#0076FF]" />
                                        Assinaturas ({stats.totalSubscriptions})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {client.subscriptions && client.subscriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {client.subscriptions.map((subscription: any) => (
                                                <div key={subscription.id} className="border-2 border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-[#1A1A1A]">{subscription.productName}</p>
                                                            {subscription.description && (
                                                                <p className="text-xs text-[#64748B]">{subscription.description}</p>
                                                            )}
                                                        </div>
                                                        <Badge className={subscription.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-500' : 'bg-slate-400 hover:bg-slate-400'}>
                                                            {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                        <div className="p-2 bg-blue-50 rounded-lg">
                                                            <p className="text-xs text-[#64748B] mb-1">Mensalidade</p>
                                                            <p className="font-bold text-[#0076FF]">
                                                                {(subscription.monthlyFeeCents / 100).toLocaleString('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL',
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="p-2 bg-slate-50 rounded-lg">
                                                            <p className="text-xs text-[#64748B] mb-1">Vencimento</p>
                                                            <p className="font-bold text-[#1A1A1A]">Dia {subscription.billingDayOfMonth}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-[#64748B] pt-3 border-t border-slate-100">
                                                        Início: {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
                                                        {subscription.contractDurationMonths && ` • ${subscription.contractDurationMonths} meses`}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                                            <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                            <p className="text-sm text-[#64748B] font-medium">Nenhuma assinatura ativa</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Faturas */}
                            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <CreditCard className="h-5 w-5 text-[#0076FF]" />
                                        Faturas Recentes ({stats.totalInvoices})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {client.invoices && client.invoices.length > 0 ? (
                                        <div className="space-y-4">
                                            {client.invoices.slice(0, 5).map((invoice: any) => (
                                                <div key={invoice.id} className="border-2 border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-[#1A1A1A]">
                                                                {invoice.description || `Fatura #${invoice.id}`}
                                                            </p>
                                                        </div>
                                                        <Badge className={
                                                            invoice.status === 'paid'
                                                                ? 'bg-emerald-500 hover:bg-emerald-500'
                                                                : invoice.status === 'overdue'
                                                                    ? 'bg-red-500 hover:bg-red-500'
                                                                    : 'bg-orange-500 hover:bg-orange-500'
                                                        }>
                                                            {invoice.status === 'paid' ? 'Paga' : invoice.status === 'overdue' ? 'Vencida' : 'Aberta'}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="p-2 bg-slate-50 rounded-lg">
                                                            <p className="text-xs text-[#64748B] mb-1">Valor</p>
                                                            <p className="font-bold text-[#1A1A1A]">
                                                                {(invoice.amountCents / 100).toLocaleString('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL',
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="p-2 bg-slate-50 rounded-lg">
                                                            <p className="text-xs text-[#64748B] mb-1">Vencimento</p>
                                                            <p className="font-bold text-[#1A1A1A]">
                                                                {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {invoice.paidAt && (
                                                        <div className="mt-3 text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg font-semibold flex items-center gap-2">
                                                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                                            Pago em {new Date(invoice.paidAt).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                                            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                            <p className="text-sm text-[#64748B] font-medium">Nenhuma fatura encontrada</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
