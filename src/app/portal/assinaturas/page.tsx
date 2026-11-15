'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
    ArrowRight,
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
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const data = await clientSubscriptionsService.getMySubscriptions();
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
            <div className="flex h-screen items-center justify-center bg-muted">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Carregando seus serviços...</p>
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
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto bg-muted min-h-screen font-inter"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        Minhas <span className="text-primary">Assinaturas</span>
                    </h1>
                    <p className="text-muted-foreground text-lg mt-2 font-medium opacity-80">
                        Gerencie seus produtos e serviços ativos na Infinity.
                    </p>
                </div>
            </motion.div>

            {/* Stats Cards refined */}
            {subscriptions.length > 0 && (
                <div className="grid gap-6 md:grid-cols-3">
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-[2rem] bg-card group hover:scale-[1.02] transition-transform duration-300">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3.5 bg-info rounded-2xl text-info-foreground">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <Badge className="bg-info text-info-foreground border border-info-border font-bold uppercase tracking-widest text-xs px-3">Total</Badge>
                                </div>
                                <div className="text-3xl font-black text-foreground mb-1">{stats.total}</div>
                                <p className="text-sm text-muted-foreground font-semibold">Serviços Contratados</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-xl shadow-emerald-200/50 rounded-[2rem] bg-card group hover:scale-[1.02] transition-transform duration-300">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3.5 bg-success rounded-2xl text-success-foreground">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <Badge className="bg-success text-success-foreground border-0 font-bold uppercase tracking-widest text-[10px] px-3">Ativos</Badge>
                                </div>
                                <div className="text-3xl font-black text-foreground mb-1">{stats.active}</div>
                                <p className="text-sm text-muted-foreground font-semibold">Em Operação</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-xl shadow-blue-500/5 rounded-[2rem] bg-card group hover:scale-[1.02] transition-transform duration-300">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3.5 bg-success text-success-foreground rounded-2xl">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <Badge className="bg-success text-success-foreground border border-success-border font-bold uppercase tracking-wide text-xs px-3">Mensal</Badge>
                                </div>
                                <div className="text-3xl font-black text-foreground mb-1">
                                    {formatCurrency(stats.totalValue)}
                                </div>
                                <p className="text-sm text-muted-foreground font-semibold">Total Mensal</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Main Subscriptions List */}
            {subscriptions.length === 0 ? (
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 bg-card rounded-[3rem]">
                        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="p-8 bg-muted border-4 border-white shadow-inner rounded-[2.5rem] mb-6">
                                <Package className="h-16 w-16 text-foreground-subtle" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-3">Expanda seu negócio</h3>
                            <p className="text-muted-foreground max-w-sm font-medium leading-relaxed mb-8">
                                Você ainda não possui assinaturas ativas. Que tal conhecer nossas soluções completas para CRM e vendas?
                            </p>
                            <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-14 px-8 rounded-2xl" asChild>
                                <a href="https://wa.me/5511945332464" target="_blank">Conhecer Soluções</a>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {subscriptions.map((sub, index) => {
                        const StatusIcon = statusConfig[sub.status]?.icon || Package;
                        const isActive = sub.status === 'active';

                        return (
                            <motion.div 
                                key={sub.id} 
                                variants={itemVariants} 
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-[2.5rem] bg-card h-full overflow-hidden flex flex-col group transition-all duration-500">
                                    <CardHeader className="p-8 bg-gradient-to-br from-slate-50/50 to-white">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-4 rounded-2xl bg-info text-info-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/20">
                                                <Package className="h-7 w-7" />
                                            </div>
                                            <Badge
                                                className={`rounded-xl px-4 py-1.5 font-bold text-xs tracking-wide uppercase ${statusConfig[sub.status]?.bgColor || 'bg-muted text-muted-foreground border border-border'}`}
                                            >
                                                <StatusIcon className="h-3 w-3 mr-1.5 fill-white/20" />
                                                {statusConfig[sub.status]?.label || sub.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-2xl font-black text-foreground leading-tight">
                                            {sub.productName}
                                        </CardTitle>
                                        {sub.description && (
                                            <p className="text-muted-foreground mt-3 font-medium text-sm leading-relaxed break-words">
                                                {sub.description}
                                            </p>
                                        )}
                                    </CardHeader>
                                    
                                    <CardContent className="p-8 pt-2 flex-1 space-y-6">
                                        {/* Financial Highlights */}
                                        <div className="bg-muted border border-border rounded-3xl p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-primary" />
                                                    Mensalidade
                                                </span>
                                                <span className="text-2xl font-black text-primary">
                                                    {formatCurrency(sub.monthlyFeeCents)}
                                                </span>
                                            </div>
                                            {sub.implementationFeeCents > 0 && (
                                                <div className="flex items-center justify-between pt-4 border-t border-input/60">
                                                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                                        Implementação
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-foreground">
                                                            {formatCurrency(sub.implementationFeeCents)}
                                                        </span>
                                                        {sub.implementationCharged && (
                                                            <div className="bg-success text-success-foreground p-1 rounded-full">
                                                                <CheckCircle className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Technical Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                                                    <Calendar className="h-3 w-3" /> Início
                                                </div>
                                                <p className="font-bold text-foreground text-sm">
                                                    {new Date(sub.startDate).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                                                    <Clock className="h-3 w-3" /> Vencimento
                                                </div>
                                                <p className="font-bold text-foreground text-sm">
                                                    Todo dia {sub.billingDayOfMonth}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Messaging */}
                                        <div className="mt-auto">
                                            {isActive ? (
                                                <div className="flex items-center gap-3 text-xs font-bold text-success-foreground bg-success/70 p-4 rounded-2xl border border-success-border/50">
                                                    <div className="h-2 w-2 rounded-full bg-success-foreground animate-pulse" />
                                                    Serviço em operação plena
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground bg-muted p-4 rounded-2xl border border-input/50">
                                                    <XCircle className="h-4 w-4" />
                                                    Inativo desde {sub.endDate ? new Date(sub.endDate).toLocaleDateString('pt-BR') : '-'}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    
                                    {/* Action Footer */}
                                    <div className="px-8 pb-8">
                                        <Button className="w-full h-14 rounded-2xl font-bold bg-muted hover:bg-info text-muted-foreground hover:text-primary transition-all border border-border" asChild>
                                            <Link href="/portal/faturas" className="flex items-center justify-center gap-2">
                                                Ver faturas deste produto <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
