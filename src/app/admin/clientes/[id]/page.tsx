'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    AlertCircle,
    Loader2,
    RefreshCcw,
    LinkIcon,
    Check,
    Copy,
    ExternalLink
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { clientsService } from '@/services/crud';
import { apiRequest } from '@/services/api';

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

    const [processingAction, setProcessingAction] = useState<number | null>(null);
    const [editingSubscription, setEditingSubscription] = useState<any>(null);
    const [subFormData, setSubFormData] = useState<any>({});
    const [savingSub, setSavingSub] = useState(false);

    const handleOpenEditSub = (sub: any) => {
        setEditingSubscription(sub);
        setSubFormData({
            productName: sub.productName,
            description: sub.description || '',
            monthlyFeeCents: (sub.monthlyFeeCents / 100).toFixed(2),
            billingDayOfMonth: sub.billingDayOfMonth,
            contractDurationMonths: sub.contractDurationMonths || '',
            crmBillingType: sub.crmBillingType || 'FIXED',
        });
    };

    const handleSaveSub = async () => {
        try {
            setSavingSub(true);
            const payload = {
                ...subFormData,
                monthlyFeeCents: Math.round(parseFloat(subFormData.monthlyFeeCents.toString().replace(',','.')) * 100)
            };
            if (!payload.contractDurationMonths) payload.contractDurationMonths = null;
            else payload.contractDurationMonths = Number(payload.contractDurationMonths);
            
            payload.billingDayOfMonth = Number(payload.billingDayOfMonth);

            await apiRequest(`/clients/${client.id}/products/${editingSubscription.id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
            alert('Assinatura atualizada com sucesso!');
            setEditingSubscription(null);
            loadClient();
        } catch (e: any) {
            alert('Erro ao atualizar assinatura: ' + (e.message || 'Falha desconhecida'));
        } finally {
            setSavingSub(false);
        }
    };

    const handleGenerateMissingInvoice = async (subId: number) => {
        try {
            setProcessingAction(subId);
            await apiRequest(`/billing/generate-all-missing/${subId}`, { method: 'POST' });
            alert('Executado com sucesso! Se havia tempo devido, a fatura foi gerada.');
            loadClient();
        } catch (e: any) {
            alert('Erro ao gerar fatura: ' + (e.message || 'Falha desconhecida'));
        } finally {
            setProcessingAction(null);
        }
    };

    const handleGeneratePix = async (invoiceId: number) => {
        try {
            setProcessingAction(invoiceId);
            const res = await apiRequest(`/invoices/${invoiceId}/generate-pix`, { method: 'POST' });
            if (res && res.pixCopyPaste) {
                navigator.clipboard.writeText(res.pixCopyPaste);
                alert('PIX Copia e Cola copiado para a área de transferência!');
            } else {
                alert('Fatura já processada ou não suporta PIX avulso no momento.');
            }
        } catch (e: any) {
            alert('Erro ao gerar PIX: ' + (e.message || 'Falha desconhecida'));
        } finally {
            setProcessingAction(null);
        }
    };

    const [syncingAsaas, setSyncingAsaas] = useState(false);
    const handleSyncAsaas = async () => {
        try {
            setSyncingAsaas(true);
            await apiRequest(`/clients/${params.id}/sync-asaas`, { method: 'POST' });
            alert('Sincronização processada! Aguarde alguns segundos para o ID ser atualizado.');
            setTimeout(loadClient, 2000);
        } catch (e: any) {
            alert('Erro ao sincronizar: ' + (e.message || 'Falha desconhecida'));
        } finally {
            setSyncingAsaas(false);
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
        activeSubscriptions: client.subscriptions?.filter((s: any) => s.status === 'ATIVO' || s.status === 'active').length || 0,
        totalInvoices: client.invoices?.length || 0,
        paidInvoices: client.invoices?.filter((i: any) => i.status === 'paid' || i.status === 'PAGA').length || 0,
        overdueInvoices: client.invoices?.filter((i: any) => i.status === 'overdue' || i.status === 'VENCIDA').length || 0,
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
                                    {client.asaasCustomerId ? (
                                        <Badge variant="outline" className="rounded-full px-3 py-1 font-mono text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                                            Asaas: {client.asaasCustomerId}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] bg-orange-50 text-orange-600 border-orange-200">
                                            Não Sincronizado
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 h-12 px-6 rounded-xl transition-all font-semibold"
                            onClick={handleSyncAsaas}
                            disabled={syncingAsaas}
                        >
                            {syncingAsaas ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RefreshCcw className="mr-2 h-5 w-5" />}
                            Sincronizar Asaas
                        </Button>
                        <Button
                            className="bg-[#0076FF] hover:bg-[#0060D0] text-white h-12 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold"
                            onClick={() => router.push(`/admin/clientes/${client.id}/editar`)}
                        >
                            <Edit className="mr-2 h-5 w-5" />
                            Editar Cliente
                        </Button>
                    </div>
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
                                            <p className="text-sm text-[#1A1A1A] font-medium break-all">
                                                {client.billingEmails?.find((e: any) => e.isPrimary)?.email || 
                                                 client.billingEmails?.[0]?.email || 
                                                 client.responsibleEmail || 
                                                 'Não informado'}
                                            </p>
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
                                            <p className="text-sm text-[#1A1A1A] font-medium">
                                                {client.street ? (
                                                    `${client.street}${client.streetNumber ? `, ${client.streetNumber}` : ''}${client.complement ? ` - ${client.complement}` : ''}${client.neighborhood ? ` - ${client.neighborhood}` : ''}${client.city ? ` - ${client.city}` : ''}${client.state ? `/${client.state}` : ''}${client.zipCode ? ` (CEP: ${client.zipCode})` : ''}`
                                                ) : 'Não informado'}
                                            </p>
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
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 flex flex-row items-center justify-between py-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Package className="h-5 w-5 text-[#0076FF]" />
                                        Assinaturas e Produtos ({stats.totalSubscriptions})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {client.subscriptions && client.subscriptions.length > 0 ? (
                                        <div className="space-y-6">
                                            {client.subscriptions.map((subscription: any) => {
                                                const isCrm = subscription.productType === 'CRM_TELECOM';
                                                const isPerUser = subscription.crmBillingType === 'PER_USER';
                                                const rate = subscription.monthlyFeeCents / 100;
                                                const userCount = subscription.crmUserCount || 0;
                                                const estimatedTotal = isPerUser ? rate * userCount : rate;

                                                const formatBrl = (val: number) => val.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                });

                                                return (
                                                    <div key={subscription.id} className={`relative overflow-hidden border rounded-3xl p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${isCrm ? 'border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50' : 'border-slate-200 bg-white'}`}>
                                                        {isCrm && (
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                                                        )}
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="space-y-1.5 text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-bold text-lg text-[#1A1A1A]">
                                                                        {subscription.productName}
                                                                    </p>
                                                                    <Badge variant="secondary" className="text-[10px] uppercase font-black px-2 py-0 bg-white border border-slate-200 text-slate-600">
                                                                        {subscription.productType === 'CRM_TELECOM' ? 'CRM' : (subscription.productType || 'PRODUTO')}
                                                                    </Badge>
                                                                </div>
                                                                {subscription.description && (
                                                                    <p className="text-sm text-[#64748B] font-medium leading-tight">{subscription.description}</p>
                                                                )}
                                                            </div>
                                                            <Badge className={`rounded-full px-3 py-1 font-bold text-xs ${subscription.status === 'active' || subscription.status === 'ATIVO' ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-200 hover:bg-emerald-500/20' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                                {subscription.status === 'active' || subscription.status === 'ATIVO' ? '● Ativo' : 'Inativo'}
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                                <p className="text-[10px] text-[#64748B] mb-1.5 uppercase font-black tracking-wider">
                                                                    {isPerUser ? 'Valor por Usuário' : 'Mensalidade Fixa'}
                                                                </p>
                                                                <div className="flex items-baseline gap-1">
                                                                    <p className="font-black text-xl text-[#0076FF]">
                                                                        {formatBrl(rate)}
                                                                    </p>
                                                                    {isPerUser && <span className="text-xs text-slate-400 font-bold">/mês</span>}
                                                                </div>
                                                            </div>

                                                            {isPerUser && (
                                                                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                                    <p className="text-[10px] text-[#64748B] mb-1.5 uppercase font-black tracking-wider">Usuários Ativos</p>
                                                                    <div className="flex items-center gap-3">
                                                                        <p className="font-black text-2xl text-slate-800 tracking-tight">{userCount}</p>
                                                                        <div className="flex -space-x-2">
                                                                            {[...Array(Math.min(userCount, 3))].map((_, i) => (
                                                                                <div key={i} className="h-5 w-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                                                                                    <User className="h-3 w-3 text-blue-600" />
                                                                                </div>
                                                                            ))}
                                                                            {userCount > 3 && <div className="text-[10px] font-bold text-slate-400 pl-3">...</div>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {!isPerUser && (
                                                                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                                    <p className="text-[10px] text-[#64748B] mb-1.5 uppercase font-black tracking-wider">Setup / Adesão</p>
                                                                    <p className="font-black text-xl text-orange-600">
                                                                        {formatBrl((subscription.implementationFeeCents || 0) / 100)}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <div className={`p-4 rounded-xl border shadow-lg ${isCrm ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white' : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white'}`}>
                                                                <p className="text-[10px] text-white/80 mb-2 uppercase font-black tracking-widest">Próxima Fatura (Est.)</p>
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-black text-2xl tracking-tighter">{formatBrl(estimatedTotal)}</p>
                                                                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                                                        <TrendingUp className="h-5 w-5 text-emerald-300" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#64748B] py-4 border-y border-slate-100/50 mb-4">
                                                            <div className="flex items-center gap-1.5 font-medium">
                                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                                Vencimento: <span className="font-bold text-slate-700">Todo dia {subscription.billingDayOfMonth}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 font-medium">
                                                                <Clock className="h-4 w-4 text-slate-400" />
                                                                Próximo: <span className="font-bold text-slate-700">
                                                                    {subscription.nextBillingDate 
                                                                        ? new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR') 
                                                                        : 'Aguardando processamento'
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 font-medium">
                                                                <Package className="h-4 w-4 text-slate-400" />
                                                                Início: <span className="font-bold text-slate-700">{new Date(subscription.startDate).toLocaleDateString('pt-BR')}</span>
                                                            </div>
                                                        </div>

                                                        {isCrm && (
                                                            <div className="bg-white/60 border border-blue-100 rounded-xl p-4 mb-4 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                                        <LinkIcon className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Integração CRM Telecom</p>
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <span className="font-bold text-slate-700">ID: {subscription.crmTenantId}</span>
                                                                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                                                            <span className="text-slate-500 font-medium">{isPerUser ? 'Faturamento por Usuário' : 'Faturamento Fixo Mensal'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Badge variant="outline" className="bg-white border-blue-200 text-blue-600 font-bold px-3 py-1">
                                                                    Sincronizado
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-center bg-slate-50/50 -m-5 mt-4 p-4 rounded-b-2xl border-t border-slate-100">
                                                            {(subscription.responsibleName || subscription.responsibleEmail) ? (
                                                                <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 pl-1">
                                                                   <User className="h-3 w-3" /> Responsável: <span className="font-bold text-slate-700">{subscription.responsibleName || 'N/A'}</span>
                                                                </div>
                                                            ) : <div></div>}
                                                            
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-9 px-4 rounded-lg font-bold transition-all"
                                                                    onClick={() => handleOpenEditSub(subscription)}
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Editar Detalhes
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 h-9 px-4 rounded-lg font-bold shadow-sm transition-all"
                                                                    onClick={() => handleGenerateMissingInvoice(subscription.id)}
                                                                    disabled={processingAction === subscription.id}
                                                                >
                                                                    {processingAction === subscription.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                                                                    Gerar Fatura Manual
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
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
                                                            invoice.status === 'paid' || invoice.status === 'PAGA'
                                                                ? 'bg-emerald-500 hover:bg-emerald-500'
                                                                : invoice.status === 'overdue' || invoice.status === 'VENCIDA'
                                                                    ? 'bg-red-500 hover:bg-red-500'
                                                                    : 'bg-orange-500 hover:bg-orange-500'
                                                        }>
                                                            {invoice.status === 'paid' || invoice.status === 'PAGA' ? 'Paga' : invoice.status === 'overdue' || invoice.status === 'VENCIDA' ? 'Vencida' : 'Aberta'}
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

                                                    <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3">
                                                        {invoice.pixCopyPaste && (
                                                            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PIX Copia e Cola</p>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-6 text-xs text-blue-600 hover:text-blue-700 p-0"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(invoice.pixCopyPaste);
                                                                            alert('PIX Copiado!');
                                                                        }}
                                                                    >
                                                                        <Copy className="h-3 w-3 mr-1" /> Copiar
                                                                    </Button>
                                                                </div>
                                                                <div className="bg-white p-2 rounded border border-slate-100 font-mono text-[10px] break-all mb-2 leading-tight text-slate-600 select-all max-h-20 overflow-y-auto">
                                                                    {invoice.pixCopyPaste}
                                                                </div>
                                                                {invoice.pixQrCodeUrl && (
                                                                    <div className="flex flex-col items-center pt-2 gap-1 border-t border-slate-100">
                                                                        <img src={invoice.pixQrCodeUrl} alt="PIX" className="w-24 h-24 border bg-white p-1 rounded" />
                                                                        <p className="text-[8px] text-slate-400">Escaneie para pagar</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex justify-between items-center">
                                                            {invoice.boletoUrl && (
                                                                <a 
                                                                    href={invoice.boletoUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" /> Ver Boleto
                                                                </a>
                                                            )}
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 rounded-lg shadow-sm font-semibold ml-auto"
                                                                onClick={() => handleGeneratePix(invoice.id)}
                                                                disabled={processingAction === invoice.id || invoice.status === 'paid' || invoice.status === 'PAGA'}
                                                            >
                                                                {processingAction === invoice.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <LinkIcon className="h-4 w-4 mr-1" />}
                                                                {invoice.pixCopyPaste ? 'Atualizar PIX' : 'Gerar PIX'}
                                                            </Button>
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

            {/* Modal de Edição de Assinatura */}
            {editingSubscription && (
                <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Editar Assinatura</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="productName" className="text-right text-xs">Produto</Label>
                                <Input
                                    id="productName"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.productName}
                                    onChange={(e) => setSubFormData({ ...subFormData, productName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right text-xs">Descrição</Label>
                                <Input
                                    id="description"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.description}
                                    onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="monthlyFeeCents" className="text-right text-xs">Valor (R$)</Label>
                                <Input
                                    id="monthlyFeeCents"
                                    type="number"
                                    step="0.01"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.monthlyFeeCents}
                                    onChange={(e) => setSubFormData({ ...subFormData, monthlyFeeCents: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="billingDayOfMonth" className="text-right text-xs">Vencimento (Dia)</Label>
                                <Input
                                    id="billingDayOfMonth"
                                    type="number"
                                    min="1"
                                    max="31"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.billingDayOfMonth}
                                    onChange={(e) => setSubFormData({ ...subFormData, billingDayOfMonth: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="contractDurationMonths" className="text-right text-xs">Prazo (Meses)</Label>
                                <Input
                                    id="contractDurationMonths"
                                    type="number"
                                    placeholder="Ex: 12"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.contractDurationMonths}
                                    onChange={(e) => setSubFormData({ ...subFormData, contractDurationMonths: e.target.value })}
                                />
                            </div>
                            {editingSubscription.productType === 'CRM_TELECOM' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-xs">Tipo (CRM)</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={subFormData.crmBillingType}
                                            onValueChange={(value) => setSubFormData({ ...subFormData, crmBillingType: value })}
                                        >
                                            <SelectTrigger className="h-8 text-sm">
                                                <SelectValue placeholder="Selecione o tipo de faturamento" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FIXED">Fixo (FIXED)</SelectItem>
                                                <SelectItem value="PER_USER">Por Usuário (PER_USER)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-4 border-t pt-4">
                            <Button variant="outline" size="sm" onClick={() => setEditingSubscription(null)}>
                                Cancelar
                            </Button>
                            <Button className="bg-[#0076FF] hover:bg-[#0076FF]/90" size="sm" onClick={handleSaveSub} disabled={savingSub}>
                                {savingSub ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

        </div>
    );
}
