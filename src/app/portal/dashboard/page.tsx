'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign,
    Calendar,
    Package,
    ArrowRight,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { invoicesService, clientSubscriptionsService } from '@/services/crud';

export default function ClientDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        openInvoices: 0,
        openAmount: 0,
        nextDue: null as string | null,
        activeServices: 0
    });
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        loadDashboardData(userData);
    }, []);

    const loadDashboardData = async (userData: any) => {
        try {
            setLoading(true);

            // Fetch invoices
            const invoices = await invoicesService.getMyInvoices();

            // Filter open invoices
            const openInvoicesList = invoices.filter((inv: any) => inv.status === 'open' || inv.status === 'overdue');
            const openAmount = openInvoicesList.reduce((acc: number, curr: any) => acc + Number(curr.amountCents), 0);

            // Find next due date
            const nextDue = openInvoicesList.length > 0
                ? openInvoicesList.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate
                : null;

            // Fetch subscriptions
            let activeServicesCount = 0;
            if (userData.clientId) {
                const subscriptions = await clientSubscriptionsService.getByClient(userData.clientId);
                activeServicesCount = subscriptions.filter((sub: any) => sub.status === 'active').length;
            }

            setStats({
                openInvoices: openInvoicesList.length,
                openAmount,
                nextDue,
                activeServices: activeServicesCount
            });

            // Set recent invoices (last 5)
            setRecentInvoices(invoices.slice(0, 5));

        } catch (error) {
            console.error('Error loading dashboard:', error);
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0076FF]"></div>
                    <p className="text-sm text-slate-500">Carregando painel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">
                        {getGreeting()}, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-[#64748B] mt-1">
                        Aqui está o resumo da sua conta hoje.
                    </p>
                </div>
                {stats.openInvoices > 0 && (
                    <div className="flex items-center gap-3 bg-orange-50 text-orange-700 px-4 py-3 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <p className="text-sm font-medium">Você tem {stats.openInvoices} fatura(s) em aberto</p>
                            <p className="text-xs opacity-90">Evite juros e bloqueios.</p>
                        </div>
                        <Button size="sm" variant="outline" className="ml-2 bg-white border-orange-200 text-orange-700 hover:bg-orange-100" asChild>
                            <Link href="/portal/faturas">Pagar agora</Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#64748B]">
                            Faturas em Aberto
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-[#0076FF]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#1A1A1A]">
                            {formatCurrency(stats.openAmount)}
                        </div>
                        <p className="text-xs text-[#64748B] mt-1">
                            {stats.openInvoices} faturas pendentes
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#64748B]">
                            Produtos Ativos
                        </CardTitle>
                        <Package className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#1A1A1A]">
                            {stats.activeServices}
                        </div>
                        <p className="text-xs text-[#64748B] mt-1">
                            Serviços contratados
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#64748B]">
                            Próximo Vencimento
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#1A1A1A]">
                            {stats.nextDue ? new Date(stats.nextDue).toLocaleDateString('pt-BR') : '-'}
                        </div>
                        {stats.nextDue && (
                            <p className="text-xs text-[#64748B] mt-1">
                                Fique atento ao prazo
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Invoices & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Invoices */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-[#1A1A1A]">Últimas Faturas</CardTitle>
                        <Button variant="ghost" size="sm" asChild className="text-[#0076FF] hover:text-[#0060D0]">
                            <Link href="/portal/faturas" className="flex items-center gap-1">
                                Ver todas <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentInvoices.length === 0 ? (
                                <p className="text-sm text-[#64748B] text-center py-8">Nenhuma fatura encontrada.</p>
                            ) : (
                                recentInvoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                h-10 w-10 rounded-full flex items-center justify-center
                                                ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                                                    invoice.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}
                                            `}>
                                                <DollarSign className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#1A1A1A]">{invoice.description || 'Fatura Mensal'}</p>
                                                <p className="text-xs text-[#64748B]">Vence em {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(Number(invoice.amountCents))}</p>
                                            <Badge variant="outline" className={`
                                                mt-1 text-xs border-0
                                                ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                    invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                                            `}>
                                                {invoice.status === 'paid' ? 'Pago' :
                                                    invoice.status === 'overdue' ? 'Vencido' : 'Em Aberto'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions / Promo */}
                <div className="space-y-6">
                    <Card className="border-slate-200 bg-gradient-to-br from-[#0076FF] to-[#00C6FF] text-white shadow-lg shadow-blue-500/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Atendimento Premium</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-blue-50 text-sm mb-6">
                                Precisa de ajuda com sua conta ou quer contratar novos serviços? Nossa equipe está pronta para te atender.
                            </p>
                            <Button className="w-full bg-white text-[#0076FF] hover:bg-blue-50 border-0 font-bold" asChild>
                                <a href="https://wa.me/5511945332464" target="_blank">Falar no WhatsApp</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-md font-medium text-[#1A1A1A]">Acesso Rápido</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <Link href="/portal/faturas" className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                <FileText className="h-6 w-6 text-[#0076FF] mb-2" />
                                <span className="text-xs font-medium text-[#64748B]">Minhas Faturas</span>
                            </Link>
                            <Link href="/portal/assinaturas" className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                <Package className="h-6 w-6 text-purple-500 mb-2" />
                                <span className="text-xs font-medium text-[#64748B]">Meus Produtos</span>
                            </Link>
                            <Link href="/portal/perfil" className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                <CheckCircle className="h-6 w-6 text-emerald-500 mb-2" />
                                <span className="text-xs font-medium text-[#64748B]">Meus Dados</span>
                            </Link>
                            <Link href="https://wa.me/5511945332464" target="_blank" className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                <Clock className="h-6 w-6 text-orange-500 mb-2" />
                                <span className="text-xs font-medium text-[#64748B]">Suporte 24h</span>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
