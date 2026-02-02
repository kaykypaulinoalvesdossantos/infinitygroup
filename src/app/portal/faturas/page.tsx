'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { invoicesService } from '@/services/crud';

const statusConfig: Record<string, { label: string; bgColor: string; icon: any }> = {
    open: { label: 'Aberta', bgColor: 'bg-orange-500', icon: Clock },
    paid: { label: 'Paga', bgColor: 'bg-emerald-500', icon: CheckCircle },
    overdue: { label: 'Vencida', bgColor: 'bg-red-500', icon: AlertCircle },
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
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }

        loadInvoices();
    }, [router]);

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

    const handleCopy = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#0076FF]" />
                    <p className="text-[#64748B] font-medium">Carregando faturas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">Minhas Faturas</h1>
                    <p className="text-[#64748B] text-lg mt-1">
                        Consulte e pague suas faturas pendentes de forma rápida e segura
                    </p>
                </div>

                {/* Stats Cards */}
                {invoices.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-4">
                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-blue-50 rounded-xl">
                                        <FileText className="h-6 w-6 text-[#0076FF]" />
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.total}</div>
                                <p className="text-sm text-[#64748B] font-medium">Total de Faturas</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-orange-50 rounded-xl">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.open}</div>
                                <p className="text-sm text-[#64748B] font-medium">Faturas Abertas</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-red-50 rounded-xl">
                                        <AlertCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    {stats.overdue > 0 && (
                                        <Badge className="bg-red-500 hover:bg-red-500 text-white">
                                            Urgente
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.overdue}</div>
                                <p className="text-sm text-[#64748B] font-medium">Faturas Vencidas</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 bg-green-50 rounded-xl">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-[#1A1A1A] mb-1">
                                    {formatCurrency(stats.totalValue)}
                                </div>
                                <p className="text-sm text-[#64748B] font-medium">Total em Aberto</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                    <CardContent className="pt-6">
                        <div className="flex justify-end">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-56 h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas ({stats.total})</SelectItem>
                                    <SelectItem value="open">Abertas ({stats.open})</SelectItem>
                                    <SelectItem value="overdue">Vencidas ({stats.overdue})</SelectItem>
                                    <SelectItem value="paid">Pagas ({stats.paid})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices Table */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A]">
                                Lista de Faturas
                            </CardTitle>
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                                {filteredInvoices.length}{' '}
                                {filteredInvoices.length === 1 ? 'fatura' : 'faturas'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {filteredInvoices.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200">
                                            <TableHead className="font-bold text-[#1A1A1A]">
                                                Descrição
                                            </TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">
                                                Vencimento
                                            </TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Valor</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Status</TableHead>
                                            <TableHead className="text-right font-bold text-[#1A1A1A]">
                                                Ações
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.map((invoice) => {
                                            const StatusIcon = statusConfig[invoice.status]?.icon || FileText;
                                            return (
                                                <TableRow
                                                    key={invoice.id}
                                                    className="hover:bg-slate-50 transition-colors border-slate-100"
                                                >
                                                    <TableCell className="font-semibold text-[#1A1A1A]">
                                                        {invoice.description ||
                                                            `${typeConfig[invoice.type]} - #${invoice.id}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm text-[#64748B]">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-[#1A1A1A]">
                                                        {formatCurrency(invoice.amountCents)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={`rounded-full font-semibold text-white shadow-sm ${statusConfig[invoice.status]?.bgColor || 'bg-slate-500'}`}
                                                        >
                                                            <StatusIcon className="h-3.5 w-3.5 mr-1" />
                                                            {statusConfig[invoice.status]?.label || invoice.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openDetails(invoice)}
                                                            className={
                                                                invoice.status === 'paid'
                                                                    ? 'h-9 hover:bg-blue-50 hover:text-[#0076FF] rounded-lg'
                                                                    : 'h-9 bg-[#0076FF] hover:bg-[#0060D0] text-white rounded-lg shadow-lg'
                                                            }
                                                        >
                                                            {invoice.status === 'paid' ? (
                                                                <>
                                                                    <Eye className="h-4 w-4 mr-1.5" />
                                                                    Comprovante
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CreditCard className="h-4 w-4 mr-1.5" />
                                                                    Pagar Agora
                                                                </>
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 bg-slate-100 rounded-full mb-4">
                                    <FileText className="h-12 w-12 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                                    Nenhuma fatura encontrada
                                </h3>
                                <p className="text-[#64748B]">Você não possui faturas nesta categoria</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-xl rounded-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-3">
                            {selectedInvoice?.status === 'paid' ? (
                                <>
                                    <div className="p-2 bg-emerald-100 rounded-full">
                                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    Comprovante de Pagamento
                                </>
                            ) : (
                                <>
                                    <div className="p-2 bg-blue-50 rounded-full">
                                        <DollarSign className="h-6 w-6 text-[#0076FF]" />
                                    </div>
                                    Pagamento PIX
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedInvoice && (
                        <>
                            {selectedInvoice.status === 'paid' ? (
                                <div className="text-center py-12 bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-2xl">
                                    <div className="mx-auto h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-emerald-900 mb-2">
                                        Pagamento Confirmado!
                                    </h3>
                                    <p className="text-emerald-700">
                                        Fatura paga em{' '}
                                        {new Date(selectedInvoice.paidAt).toLocaleDateString('pt-BR')} às{' '}
                                        {new Date(selectedInvoice.paidAt).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            ) : (
                                <InvoicePixViewer invoiceId={selectedInvoice.id} invoice={selectedInvoice} />
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
