'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InvoicePixViewer } from '@/components/invoice-pix-viewer';
import {
    Eye,
    Copy,
    Check,
    CreditCard,
    Smartphone,
    FileText,
    Download,
    DollarSign,
    Loader2,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    ArrowRight,
    ChevronRight,
    Search,
    Filter,
} from 'lucide-react';
import { invoicesService } from '@/services/crud';

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string; icon: any }> = {
    open: { label: 'Aberta', bgColor: 'bg-warning', textColor: 'text-warning-foreground', borderColor: 'border-warning-border', icon: Clock },
    paid: { label: 'Paga', bgColor: 'bg-success', textColor: 'text-success-foreground', borderColor: 'border-success-border', icon: CheckCircle },
    overdue: { label: 'Vencida', bgColor: 'bg-danger', textColor: 'text-danger-foreground', borderColor: 'border-danger-border', icon: AlertCircle },
};

const typeConfig: Record<string, string> = {
    implementation: 'Implementação',
    monthly: 'Mensalidade',
    additional: 'Adicional',
};

export default function ClientInvoicesPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoicesService.getMyInvoices();
            setInvoices(data);
        } catch (error) {
            console.error('Error loading invoices:', error);
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

    const openDetails = (invoice: any) => {
        setSelectedInvoice(invoice);
        setDetailsOpen(true);
    };

    const filteredInvoices = invoices.filter((invoice) => {
        return statusFilter === 'all' || invoice.status === statusFilter;
    });

    const stats = {
        total: invoices.length,
        open: invoices.filter((i) => i.status === 'open').length,
        paid: invoices.filter((i) => i.status === 'paid').length,
        overdue: invoices.filter((i) => i.status === 'overdue').length,
        totalValue: invoices
            .filter((i) => i.status !== 'paid')
            .reduce((sum, i) => sum + Number(i.amountCents), 0),
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
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
                    <p className="text-muted-foreground font-medium animate-pulse">Carregando financeiro...</p>
                </div>
            </div>
        );
    }

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
                        Meu <span className="text-primary">Financeiro</span>
                    </h1>
                    <p className="text-muted-foreground text-lg mt-2 font-medium opacity-80">
                        Acompanhe seus pagamentos e faturas de forma transparente.
                    </p>
                </div>
            </motion.div>

            {/* Premium Stats Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-xl shadow-blue-200/50 rounded-[2rem] bg-card group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-info rounded-2xl text-info-foreground">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <Badge className="bg-info text-info-foreground border border-info-border font-bold text-xs uppercase tracking-wide px-3">Total</Badge>
                            </div>
                            <div className="text-3xl font-black text-foreground mb-1">{stats.total}</div>
                            <p className="text-sm text-muted-foreground font-medium opacity-70">Faturas emitidas</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-xl shadow-orange-200/50 rounded-[2rem] bg-card group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-warning rounded-2xl text-warning-foreground">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <Badge className="bg-warning text-warning-foreground border-0 font-bold text-[10px] uppercase tracking-widest px-3">Abertas</Badge>
                            </div>
                            <div className="text-3xl font-black text-foreground mb-1">{stats.open}</div>
                            <p className="text-sm text-muted-foreground font-medium opacity-70">Aguardando pagamento</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-xl shadow-red-200/50 rounded-[2rem] bg-card group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-danger rounded-2xl text-danger-foreground">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                {stats.overdue > 0 && <span className="flex h-2 w-2 rounded-full bg-danger-foreground animate-ping" />}
                                <Badge className="bg-danger text-danger-foreground border-0 font-bold text-[10px] uppercase tracking-widest px-3">Vencidas</Badge>
                            </div>
                            <div className="text-3xl font-black text-foreground mb-1">{stats.overdue}</div>
                            <p className="text-sm text-muted-foreground font-medium opacity-70">Regularizar urgente</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-xl shadow-emerald-200/50 rounded-[2rem] bg-card group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-success rounded-2xl text-success-foreground">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <Badge className="bg-success text-success-foreground border-0 font-bold text-[10px] uppercase tracking-widest px-3">Mensal</Badge>
                            </div>
                            <div className="text-2xl font-black text-foreground mb-1">{formatCurrency(stats.totalValue)}</div>
                            <p className="text-sm text-muted-foreground font-medium opacity-70">Total pendente</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters & Content Area */}
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-xl">
                            <Filter className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-black text-foreground">Historico de Faturas</h2>
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-64 h-12 bg-muted border-0 rounded-2xl font-bold text-foreground focus:ring-2 focus:ring-blue-500/20 transition-all">
                            <SelectValue placeholder="Filtrar por Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-0 shadow-2xl">
                            <SelectItem value="all" className="font-bold py-3">Todas as faturas</SelectItem>
                            <SelectItem value="open" className="font-bold py-3 text-warning-foreground">Abertas</SelectItem>
                            <SelectItem value="overdue" className="font-bold py-3 text-danger-foreground">Vencidas</SelectItem>
                            <SelectItem value="paid" className="font-bold py-3 text-success-foreground">Pagas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-card rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-border overflow-hidden">
                    {filteredInvoices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="py-6 px-8 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Descrição do Serviço</TableHead>
                                        <TableHead className="py-6 px-8 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Vencimento</TableHead>
                                        <TableHead className="py-6 px-8 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Valor Total</TableHead>
                                        <TableHead className="py-6 px-8 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Status</TableHead>
                                        <TableHead className="py-6 px-8 text-right font-black text-muted-foreground uppercase tracking-widest text-[10px]">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredInvoices.map((invoice, idx) => {
                                            const StatusIcon = statusConfig[invoice.status]?.icon || FileText;
                                            const isPaid = invoice.status === 'paid';
                                            
                                            return (
                                                <motion.tr
                                                    key={invoice.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="group hover:bg-muted/80 transition-colors border-b border-border"
                                                >
                                                    <TableCell className="py-6 px-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-2xl transition-all duration-300 ${isPaid ? 'bg-success text-success-foreground' : 'bg-info text-info-foreground group-hover:bg-primary group-hover:text-primary-foreground'}`}>
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-foreground leading-none mb-1">
                                                                    {invoice.description || `${typeConfig[invoice.type]} #${invoice.id}`}
                                                                </p>
                                                                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">ID: {invoice.id}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-6 px-8">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-foreground">{new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</span>
                                                            <span className="text-[11px] text-muted-foreground font-medium font-inter">Prazo Final</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-6 px-8">
                                                        <span className={`text-lg font-black ${isPaid ? 'text-success-foreground' : 'text-foreground'}`}>
                                                            {formatCurrency(invoice.amountCents)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-6 px-8">
                                                        <Badge
                                                            className={`rounded-2xl px-4 py-2 font-bold text-xs tracking-wide uppercase border ${statusConfig[invoice.status]?.bgColor} ${statusConfig[invoice.status]?.textColor} ${statusConfig[invoice.status]?.borderColor}`}
                                                        >
                                                            <StatusIcon className="h-3 w-3 mr-2" />
                                                            {statusConfig[invoice.status]?.label || invoice.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-6 px-8 text-right">
                                                        <Button
                                                            onClick={() => openDetails(invoice)}
                                                            className={`h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg ${
                                                                isPaid 
                                                                ? 'bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600' 
                                                                : 'bg-[#0076FF] hover:bg-[#0060D0] text-white hover:shadow-blue-500/25'
                                                            }`}
                                                        >
                                                            {isPaid ? (
                                                                <>Recibo <Eye className="ml-2 h-4 w-4" /></>
                                                            ) : (
                                                                <>Quitar PIX <ArrowRight className="ml-2 h-4 w-4" /></>
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="p-10 bg-muted rounded-[3rem] border-4 border-white shadow-inner mb-8">
                                <Search className="h-16 w-16 text-foreground-subtle" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-3">Nenhuma fatura encontrada</h3>
                            <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                                Não encontramos registros financeiros para os filtros selecionados no momento.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Premium Payment Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto p-0 border-0 rounded-2xl sm:rounded-[3rem] shadow-2xl">
                    <div className="p-4 sm:p-10 bg-card">
                        <DialogHeader className="mb-5 sm:mb-8">
                            <div className="flex items-center gap-3 sm:gap-5">
                                <div className={`shrink-0 p-3 sm:p-4 rounded-2xl sm:rounded-3xl ${selectedInvoice?.status === 'paid' ? 'bg-success text-success-foreground' : 'bg-info text-info-foreground'}`}>
                                    {selectedInvoice?.status === 'paid' ? <CheckCircle className="h-8 w-8" /> : <DollarSign className="h-8 w-8" />}
                                </div>
                                <div>
                                    <DialogTitle className="text-xl sm:text-3xl font-black text-foreground tracking-tight break-words">
                                        {selectedInvoice?.status === 'paid' ? 'Recibo de Quitação' : 'Finalizar Pagamento'}
                                    </DialogTitle>
                                    <p className="text-muted-foreground font-medium opacity-80">
                                        Referente à fatura #{selectedInvoice?.id} • {selectedInvoice && typeConfig[selectedInvoice.type]}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>

                        {selectedInvoice && (
                            <div className="space-y-5 sm:space-y-8">
                                {selectedInvoice.status === 'paid' ? (
                                    <div className="bg-success/50 border-2 border-success-border rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-10 text-center space-y-5 sm:space-y-6">
                                        <div className="mx-auto h-24 w-24 bg-card rounded-full flex items-center justify-center shadow-emerald-200/50 shadow-xl border-4 border-success-border">
                                            <CheckCircle className="h-12 w-12 text-success-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl sm:text-3xl font-black text-success-foreground mb-2">Pago com Sucesso!</h3>
                                            <div className="inline-block px-4 py-2 bg-card rounded-2xl shadow-sm border border-success-border font-black text-success-foreground text-xl">
                                                {formatCurrency(selectedInvoice.amountCents)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4">
                                            <div className="bg-card p-4 rounded-2xl border border-success-border/50">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Data do Pagamento</p>
                                                <p className="font-bold text-foreground">
                                                    {new Date(selectedInvoice.paidAt).toLocaleDateString('pt-BR')} às {new Date(selectedInvoice.paidAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="bg-card p-4 rounded-2xl border border-success-border/50 text-left">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Metodo</p>
                                                <div className="flex items-center gap-2 font-bold text-foreground">
                                                    <Smartphone className="h-4 w-4 text-primary" /> PIX Instantâneo
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-border shadow-xl">
                                        <InvoicePixViewer invoiceId={selectedInvoice.id} invoice={selectedInvoice} />
                                    </div>
                                )}
                                
                                <div className="flex justify-center">
                                    <Button 
                                        onClick={() => setDetailsOpen(false)}
                                        className="h-12 sm:h-14 px-8 sm:px-10 rounded-xl sm:rounded-2xl font-black bg-muted hover:bg-muted text-foreground transition-all"
                                    >
                                        Fechar Detalhes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
