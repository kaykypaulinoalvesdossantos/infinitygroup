'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Calendar,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Loader2,
    TrendingUp,
    AlertCircle,
} from 'lucide-react';
import { clientSubscriptionsService } from '@/services/crud';

const statusConfig: Record<string, { label: string; bgColor: string; icon: any }> = {
    active: { label: 'Ativo', bgColor: 'bg-emerald-500', icon: CheckCircle },
    canceled: { label: 'Cancelado', bgColor: 'bg-slate-500', icon: XCircle },
    suspended: { label: 'Suspenso', bgColor: 'bg-orange-500', icon: AlertCircle },
};

export default function ClientSubscriptionsPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }
        const userData = JSON.parse(user);
        if (userData.clientId) {
            loadSubscriptions(userData.clientId);
        } else {
            setLoading(false);
        }
    }, []);

    const loadSubscriptions = async (clientId: number) => {
        try {
            setLoading(true);
            const data = await clientSubscriptionsService.getByClient(clientId);
            setSubscriptions(data);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100);
    };

    const formatDuration = (months: number | null) => {
        if (!months) return 'Indeterminado';
        if (months === 1) return '1 mês';
        if (months < 12) return `${months} meses`;
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
        return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#0076FF]" />
                    <p className="text-[#64748B] font-medium">Carregando assinaturas...</p>
                </div>
            </div>
        );
    }

    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter((s) => s.status === 'active').length,
        totalValue: subscriptions
            .filter((s) => s.status === 'active')
            .reduce((sum, s) => sum + Number(s.monthlyFeeCents), 0),
    };

    return (
        <div className="p-6 md:p-10 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">Minhas Assinaturas</h1>
                    <p className="text-[#64748B] text-lg mt-1">
                        Gerencie seus produtos e serviços contratados
                    </p>
                </div>

                {/* Stats Cards */}
                {subscriptions.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-blue-50 rounded-xl">
                                        <Package className="h-6 w-6 text-[#0076FF]" />
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.total}</div>
                                <p className="text-sm text-[#64748B] font-medium">Total de Serviços</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-emerald-50 rounded-xl">
                                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                </div>
                                <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.active}</div>
                                <p className="text-sm text-[#64748B] font-medium">Serviços Ativos</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-green-50 rounded-xl">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
                                    {formatCurrency(stats.totalValue)}
                                </div>
                                <p className="text-sm text-[#64748B] font-medium">Total Mensal</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Subscriptions */}
                {subscriptions.length === 0 ? (
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="p-4 bg-slate-100 rounded-full mb-4">
                                <Package className="h-12 w-12 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Nenhuma assinatura encontrada</h3>
                            <p className="text-[#64748B] max-w-md">
                                Entre em contato com o suporte para contratar nossos serviços e começar a usar
                                nossas soluções.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {subscriptions.map((sub) => {
                            const StatusIcon = statusConfig[sub.status]?.icon || Package;
                            const isActive = sub.status === 'active';

                            return (
                                <Card
                                    key={sub.id}
                                    className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group"
                                >
                                    <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-3 rounded-xl bg-blue-50 text-[#0076FF] group-hover:bg-[#0076FF] group-hover:text-white transition-all duration-300">
                                                <Package className="h-6 w-6" />
                                            </div>
                                            <Badge
                                                className={`rounded-full font-semibold text-white shadow-sm ${statusConfig[sub.status]?.bgColor || 'bg-slate-500'}`}
                                            >
                                                <StatusIcon className="h-3.5 w-3.5 mr-1" />
                                                {statusConfig[sub.status]?.label || sub.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl font-bold text-[#1A1A1A]">
                                            {sub.productName}
                                        </CardTitle>
                                        {sub.description && (
                                            <p className="text-sm text-[#64748B] mt-2">{sub.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        {/* Valores */}
                                        <div className="bg-slate-50 border-2 border-slate-100 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#64748B] font-medium flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" />
                                                    Mensalidade
                                                </span>
                                                <span className="text-lg font-bold text-[#0076FF]">
                                                    {formatCurrency(sub.monthlyFeeCents)}
                                                </span>
                                            </div>
                                            {sub.implementationFeeCents > 0 && (
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                                    <span className="text-xs text-[#64748B] flex items-center gap-1.5">
                                                        <FileText className="h-3.5 w-3.5" />
                                                        Taxa de Implementação
                                                    </span>
                                                    <span className="text-sm font-semibold">
                                                        {formatCurrency(sub.implementationFeeCents)}
                                                        {sub.implementationCharged && (
                                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 inline ml-1" />
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Informações */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#64748B] font-medium flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Data de Início
                                                </span>
                                                <span className="font-semibold text-[#1A1A1A]">
                                                    {new Date(sub.startDate).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#64748B] font-medium flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Dia de Vencimento
                                                </span>
                                                <span className="font-semibold text-[#1A1A1A]">
                                                    Dia {sub.billingDayOfMonth}
                                                </span>
                                            </div>

                                            {sub.contractDurationMonths && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-[#64748B] font-medium flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        Duração do Contrato
                                                    </span>
                                                    <span className="font-semibold text-[#1A1A1A]">
                                                        {formatDuration(sub.contractDurationMonths)}
                                                    </span>
                                                </div>
                                            )}

                                            {sub.nextBillingDate && isActive && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-[#64748B] font-medium flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        Próximo Faturamento
                                                    </span>
                                                    <span className="font-semibold text-[#1A1A1A]">
                                                        {new Date(sub.nextBillingDate).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Footer */}
                                        <div className="pt-4 border-t border-slate-100">
                                            {isActive ? (
                                                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-xl">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Serviço operando normalmente
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 p-3 rounded-xl">
                                                    <XCircle className="h-4 w-4" />
                                                    Serviço inativo
                                                    {sub.endDate && (
                                                        <span className="text-[#64748B]">
                                                            • Cancelado em{' '}
                                                            {new Date(sub.endDate).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        {sub.notes && (
                                            <div className="bg-blue-50 border-2 border-blue-100 p-3 rounded-xl">
                                                <p className="text-xs font-semibold text-blue-900 mb-1">
                                                    Observações:
                                                </p>
                                                <p className="text-sm text-blue-700">{sub.notes}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
