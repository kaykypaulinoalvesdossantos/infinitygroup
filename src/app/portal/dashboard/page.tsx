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
    FileText,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
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
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch invoices and subscriptions in parallel for performance
            const [invoices, subscriptions] = await Promise.all([
                invoicesService.getMyInvoices(),
                clientSubscriptionsService.getMySubscriptions()
            ]);

            // Filter open invoices
            const openInvoicesList = invoices.filter((inv: any) => inv.status === 'open' || inv.status === 'overdue');
            const openAmount = openInvoicesList.reduce((acc: number, curr: any) => acc + Number(curr.amountCents), 0);

            // Find next due date
            const nextDue = openInvoicesList.length > 0
                ? openInvoicesList.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate
                : null;

            const activeServicesCount = subscriptions.filter((sub: any) => sub.status === 'active').length;

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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#0076FF]" />
                    <p className="text-[#64748B] font-medium animate-pulse">Iniciando sua experiência...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto bg-[#F8FAFC] min-h-screen font-inter"
        >
            {/* Header section with refined aesthetics */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                        {getGreeting()}, <span className="text-[#0076FF]">{user?.name?.split(' ')[0]}</span>!
                    </h1>
                    <p className="text-[#64748B] text-lg mt-2 font-medium opacity-80">
                        Bem-vindo ao seu centro de controle Infinity.
                    </p>
                </div>
                
                {stats.openInvoices > 0 && (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-4 bg-white p-4 rounded-2xl border-l-4 border-orange-500 shadow-xl shadow-orange-500/5"
                    >
                        <div className="bg-orange-50 p-2.5 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#1A1A1A]">Pendente de Pagamento</p>
                            <p className="text-xs text-orange-600 font-semibold">{stats.openInvoices} fatura(s) aguardando</p>
                        </div>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-0 font-bold ml-2 shadow-lg shadow-orange-500/20" asChild>
                            <Link href="/portal/faturas">Pagar</Link>
                        </Button>
                    </motion.div>
                )}
            </motion.div>

            {/* Stats Grid with dynamic cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div variants={itemVariants}>
                    <Card className="border-0 bg-white shadow-2xl shadow-blue-500/5 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-blue-50 rounded-2xl text-[#0076FF] group-hover:bg-[#0076FF] group-hover:text-white transition-colors duration-300">
                                    <DollarSign className="h-7 w-7" />
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financeiro</div>
                            </div>
                            <div className="text-3xl font-black text-[#1A1A1A]">
                                {formatCurrency(stats.openAmount)}
                            </div>
                            <p className="text-sm font-semibold text-[#64748B] mt-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                {stats.openInvoices} faturas em aberto
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-0 bg-white shadow-2xl shadow-emerald-500/5 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                    <Package className="h-7 w-7" />
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Serviços</div>
                            </div>
                            <div className="text-3xl font-black text-[#1A1A1A]">
                                {stats.activeServices}
                            </div>
                            <p className="text-sm font-semibold text-[#64748B] mt-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Produtos ativos agora
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-0 bg-white shadow-2xl shadow-orange-500/5 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-orange-50 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                                    <Calendar className="h-7 w-7" />
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agenda</div>
                            </div>
                            <div className="text-3xl font-black text-[#1A1A1A]">
                                {stats.nextDue ? new Date(stats.nextDue).toLocaleDateString('pt-BR') : '-'}
                            </div>
                            <p className="text-sm font-semibold text-[#64748B] mt-2">
                                {stats.nextDue ? 'Próximo vencimento' : 'Nenhum vencimento próximo'}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Content body split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Items with polished list */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[#1A1A1A]">Movimentações Recentes</h2>
                        <Link href="/portal/faturas" className="text-sm font-bold text-[#0076FF] hover:underline flex items-center gap-1 group">
                            Ver histórico completo <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    
                    <Card className="border-0 bg-white shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-1">
                            <div className="divide-y divide-slate-100">
                                {recentInvoices.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-medium">Nenhum registro encontrado ainda.</p>
                                    </div>
                                ) : (
                                    recentInvoices.map((invoice) => (
                                        <div key={invoice.id} className="flex items-center justify-between p-6 hover:bg-slate-50/80 transition-colors">
                                            <div className="flex items-center gap-5">
                                                <div className={`
                                                    h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner
                                                    ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                                        invoice.status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}
                                                `}>
                                                    <DollarSign className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#1A1A1A] text-base">{invoice.description || 'Fatura de Serviço'}</p>
                                                    <p className="text-sm text-[#64748B] font-medium">Vence em {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-[#1A1A1A] text-lg">{formatCurrency(Number(invoice.amountCents))}</p>
                                                <Badge className={`
                                                    mt-2 px-3 py-1 rounded-lg border-0 font-bold uppercase tracking-tighter text-[10px]
                                                    ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                                                `}>
                                                    {invoice.status === 'paid' ? 'Liquidado' :
                                                        invoice.status === 'overdue' ? 'Vencido' : 'Pendente'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sidebar with focus on action & support */}
                <motion.div variants={itemVariants} className="space-y-8">
                    {/* Support Card - High impact */}
                    <Card className="border-0 bg-gradient-to-br from-[#0076FF] to-[#0158bd] text-white shadow-2xl shadow-blue-500/30 rounded-[2.5rem] p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <CardHeader className="relative z-10">
                            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                                <Clock className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-2xl font-black">Suporte Exclusivo</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <p className="text-blue-50/90 text-sm mb-8 leading-relaxed font-medium">
                                Alguma dúvida sobre seus serviços ou faturamento? Nossa equipe VIP está a um clique de distância.
                            </p>
                            <Button className="w-full bg-white text-[#0076FF] hover:bg-blue-50 border-0 font-black h-14 rounded-2xl shadow-xl shadow-black/10 text-base" asChild>
                                <a href="https://wa.me/5511945332464" target="_blank" className="flex items-center gap-2">
                                    Acessar WhatsApp <ArrowRight className="h-5 w-5" />
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Access List */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Painel Rápido</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/portal/faturas" className="group flex flex-col items-center justify-center p-6 rounded-[1.8rem] bg-white hover:bg-[#0076FF] transition-all duration-300 shadow-xl shadow-slate-200/50">
                                <FileText className="h-7 w-7 text-[#0076FF] group-hover:text-white mb-3 transition-colors" />
                                <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-white transition-colors">Minhas Faturas</span>
                            </Link>
                            <Link href="/portal/assinaturas" className="group flex flex-col items-center justify-center p-6 rounded-[1.8rem] bg-white hover:bg-purple-600 transition-all duration-300 shadow-xl shadow-slate-200/50">
                                <Package className="h-7 w-7 text-purple-600 group-hover:text-white mb-3 transition-colors" />
                                <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-white transition-colors">Assinaturas</span>
                            </Link>
                            <Link href="/portal/perfil" className="group flex flex-col items-center justify-center p-6 rounded-[1.8rem] bg-white hover:bg-emerald-600 transition-all duration-300 shadow-xl shadow-slate-200/50">
                                <CheckCircle className="h-7 w-7 text-emerald-600 group-hover:text-white mb-3 transition-colors" />
                                <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-white transition-colors">Meu Perfil</span>
                            </Link>
                            <Link href="https://wa.me/5511945332464" target="_blank" className="group flex flex-col items-center justify-center p-6 rounded-[1.8rem] bg-white hover:bg-orange-500 transition-all duration-300 shadow-xl shadow-slate-200/50">
                                <Clock className="h-7 w-7 text-orange-500 group-hover:text-white mb-3 transition-colors" />
                                <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-white transition-colors">Suporte</span>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
