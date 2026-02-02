'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Eye,
    Copy,
    Check,
    CreditCard,
    Smartphone,
    FileText,
    Search,
    CheckCircle,
    Loader2,
    TrendingUp,
    AlertCircle,
    DollarSign,
    Calendar,
    Clock,
} from 'lucide-react';
import { authService } from '@/services/auth';
import { invoicesService } from '@/services/crud';

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; icon: any }> = {
    open: { label: 'Aberta', bgColor: 'bg-orange-500', textColor: 'text-orange-600', icon: Clock },
    paid: { label: 'Paga', bgColor: 'bg-emerald-500', textColor: 'text-emerald-600', icon: CheckCircle },
    overdue: { label: 'Vencida', bgColor: 'bg-red-500', textColor: 'text-red-600', icon: AlertCircle },
};

const typeConfig: Record<string, string> = {
    implementation: 'Implementação',
    monthly: 'Mensalidade',
    additional: 'Adicional',
};

export default function FaturasPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentDate, setPaymentDate] = useState('');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        loadInvoices();
    }, [router]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoicesService.getAll();
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

    const openPaymentModal = (invoice: any) => {
        setSelectedInvoice(invoice);
        const today = new Date().toISOString().split('T')[0];
        setPaymentDate(today);
        setPaymentModalOpen(true);
    };

    const markAsPaid = async () => {
        if (!selectedInvoice || !paymentDate) return;

        try {
            setProcessingPayment(true);

            await invoicesService.update(selectedInvoice.id, {
                status: 'paid',
                paidAt: new Date(paymentDate).toISOString(),
                paidAmountCents: selectedInvoice.amountCents,
            });

            await loadInvoices();
            setPaymentModalOpen(false);
            setSelectedInvoice(null);
            setPaymentDate('');
        } catch (error) {
            console.error('Error marking as paid:', error);
            alert('Erro ao marcar fatura como paga');
        } finally {
            setProcessingPayment(false);
        }
    };

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        const matchesSearch =
            !searchTerm ||
            invoice.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100);
    };

    const stats = {
        total: invoices.length,
        open: invoices.filter((i) => i.status === 'open').length,
        paid: invoices.filter((i) => i.status === 'paid').length,
        overdue: invoices.filter((i) => i.status === 'overdue').length,
        totalValue: invoices.reduce((sum, i) => sum + Number(i.amountCents), 0),
    };

    const openDetails = (invoice: any) => {
        setSelectedInvoice(invoice);
        setDetailsOpen(true);
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
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">Faturas</h1>
                    <p className="text-[#64748B] text-lg mt-1">Gerencie todas as faturas e cobranças do sistema</p>
                </div>

                {/* Stats Cards */}
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
                                <div className="p-2.5 bg-emerald-50 rounded-xl">
                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.paid}</div>
                            <p className="text-sm text-[#64748B] font-medium">Faturas Pagas</p>
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
                                    <Badge className="bg-red-500 hover:bg-red-500 text-white">Urgente</Badge>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.overdue}</div>
                            <p className="text-sm text-[#64748B] font-medium">Faturas Vencidas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#64748B]" />
                                <Input
                                    placeholder="Buscar por cliente ou descrição..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-56 h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas ({stats.total})</SelectItem>
                                    <SelectItem value="open">Abertas ({stats.open})</SelectItem>
                                    <SelectItem value="paid">Pagas ({stats.paid})</SelectItem>
                                    <SelectItem value="overdue">Vencidas ({stats.overdue})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices Table */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A]">Lista de Faturas</CardTitle>
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                                {filteredInvoices.length} {filteredInvoices.length === 1 ? 'fatura' : 'faturas'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {filteredInvoices.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200">
                                            <TableHead className="font-bold text-[#1A1A1A]">ID</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Cliente</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Tipo</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Vencimento</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Valor</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Status</TableHead>
                                            <TableHead className="text-right font-bold text-[#1A1A1A]">Ações</TableHead>
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
                                                    <TableCell className="font-mono text-sm text-[#64748B]">
                                                        #{invoice.id}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-[#1A1A1A]">
                                                        {invoice.client?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-medium border-slate-300">
                                                            {typeConfig[invoice.type] || invoice.type}
                                                        </Badge>
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
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openDetails(invoice)}
                                                                className="h-9 hover:bg-blue-50 hover:text-[#0076FF] rounded-lg"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1.5" />
                                                                Ver
                                                            </Button>
                                                            {invoice.status !== 'paid' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openPaymentModal(invoice)}
                                                                    className="h-9 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                                                    Pagar
                                                                </Button>
                                                            )}
                                                        </div>
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
                                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Nenhuma fatura encontrada</h3>
                                <p className="text-[#64748B]">
                                    Tente ajustar os filtros ou buscar por outro termo
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Payment Modal */}
            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 rounded-full">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            Marcar como Paga
                        </DialogTitle>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[#64748B]">Cliente:</span>
                                    <span className="text-sm font-semibold text-[#1A1A1A]">
                                        {selectedInvoice.client?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[#64748B]">Valor:</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                        {formatCurrency(selectedInvoice.amountCents)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[#64748B]">Vencimento:</span>
                                    <span className="text-sm font-medium">
                                        {new Date(selectedInvoice.dueDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[#1A1A1A]">
                                    Data do Pagamento <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="h-12 border-2 border-slate-200 rounded-xl"
                                />
                                <p className="text-xs text-[#64748B]">Informe quando o pagamento foi realizado</p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-2"
                                    onClick={() => setPaymentModalOpen(false)}
                                    disabled={processingPayment}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                                    onClick={markAsPaid}
                                    disabled={!paymentDate || processingPayment}
                                >
                                    {processingPayment ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Confirmar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Invoice Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-full">
                                <FileText className="h-6 w-6 text-[#0076FF]" />
                            </div>
                            Fatura #{selectedInvoice?.id}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <Card className="border-2 border-slate-200 rounded-xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
                                    <CardTitle className="text-lg font-bold">Informações Básicas</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase">Cliente</p>
                                            <p className="font-semibold text-[#1A1A1A]">
                                                {selectedInvoice.client?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase">Tipo</p>
                                            <Badge variant="outline" className="font-semibold">
                                                {typeConfig[selectedInvoice.type] || selectedInvoice.type}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase">Valor Total</p>
                                            <p className="font-bold text-2xl text-[#0076FF]">
                                                {formatCurrency(selectedInvoice.amountCents)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase">Status</p>
                                            <Badge
                                                className={`rounded-full font-semibold text-white ${statusConfig[selectedInvoice.status]?.bgColor}`}
                                            >
                                                {statusConfig[selectedInvoice.status]?.label}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase">Emissão</p>
                                            <p className="font-medium">
                                                {new Date(selectedInvoice.issueDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase">Vencimento</p>
                                            <p className="font-medium">
                                                {new Date(selectedInvoice.dueDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        {selectedInvoice.paidAt && (
                                            <div className="md:col-span-2 space-y-1">
                                                <p className="text-xs font-semibold text-[#64748B] uppercase">
                                                    Pago Em
                                                </p>
                                                <p className="font-semibold text-emerald-600">
                                                    {new Date(selectedInvoice.paidAt).toLocaleDateString('pt-BR')} às{' '}
                                                    {new Date(selectedInvoice.paidAt).toLocaleTimeString('pt-BR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                        {selectedInvoice.description && (
                                            <div className="md:col-span-2 space-y-1">
                                                <p className="text-xs font-semibold text-[#64748B] uppercase">
                                                    Descrição
                                                </p>
                                                <p className="text-sm text-[#1A1A1A]">{selectedInvoice.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Boleto */}
                            {selectedInvoice.boletoBarcode && (
                                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white rounded-xl">
                                    <CardHeader className="border-b border-orange-200">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-orange-600" />
                                            Boleto Bancário
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold text-[#64748B] mb-2">
                                                Código de Barras
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 p-3 bg-white border-2 border-orange-200 rounded-lg text-sm font-mono overflow-x-auto">
                                                    {selectedInvoice.boletoBarcode}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCopy(selectedInvoice.boletoBarcode, 'boleto')}
                                                    className="border-2 border-orange-200 hover:bg-orange-100 h-12 px-4"
                                                >
                                                    {copiedField === 'boleto' ? (
                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* PIX */}
                            {selectedInvoice.pixCopyPaste && (
                                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white rounded-xl">
                                    <CardHeader className="border-b border-blue-200">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Smartphone className="h-5 w-5 text-blue-600" />
                                            PIX
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        {selectedInvoice.pixQrCodeUrl && (
                                            <div className="flex justify-center">
                                                <div className="p-4 bg-white rounded-xl border-2 border-blue-200">
                                                    <img
                                                        src={selectedInvoice.pixQrCodeUrl}
                                                        alt="QR Code PIX"
                                                        className="w-48 h-48"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-[#64748B] mb-2">Copia e Cola</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 p-3 bg-white border-2 border-blue-200 rounded-lg text-xs font-mono break-all overflow-x-auto max-h-20">
                                                    {selectedInvoice.pixCopyPaste}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCopy(selectedInvoice.pixCopyPaste, 'pix')}
                                                    className="border-2 border-blue-200 hover:bg-blue-100 h-12 px-4"
                                                >
                                                    {copiedField === 'pix' ? (
                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
