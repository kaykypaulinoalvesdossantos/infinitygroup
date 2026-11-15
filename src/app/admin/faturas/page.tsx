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
    ABERTA: { label: 'Aberta', bgColor: 'bg-warning border border-warning-border', textColor: 'text-warning-foreground', icon: Clock },
    PAGA: { label: 'Paga', bgColor: 'bg-success border border-success-border', textColor: 'text-success-foreground', icon: CheckCircle },
    VENCIDA: { label: 'Vencida', bgColor: 'bg-danger border border-danger-border', textColor: 'text-danger-foreground', icon: AlertCircle },
    CANCELADA: { label: 'Cancelada', bgColor: 'bg-muted border border-border', textColor: 'text-muted-foreground', icon: AlertCircle },
    PARCIALMENTE_PAGA: { label: 'Parcial', bgColor: 'bg-info border border-info-border', textColor: 'text-info-foreground', icon: Clock },
    ESTORNADA: { label: 'Estornada', bgColor: 'bg-muted border border-border', textColor: 'text-muted-foreground', icon: AlertCircle },
};

const typeConfig: Record<string, string> = {
    IMPLEMENTACAO: 'Implementação',
    MENSALIDADE: 'Mensalidade',
    ADICIONAL: 'Adicional',
    PRORATA: 'Pró-rata',
    ENCERRAMENTO: 'Encerramento',
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
                status: 'PAGA',
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
        open: invoices.filter((i) => i.status === 'ABERTA').length,
        paid: invoices.filter((i) => i.status === 'PAGA').length,
        overdue: invoices.filter((i) => i.status === 'VENCIDA').length,
        totalValue: invoices.reduce((sum, i) => sum + Number(i.amountCents), 0),
    };

    const openDetails = (invoice: any) => {
        setSelectedInvoice(invoice);
        setDetailsOpen(true);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-link" />
                    <p className="text-muted-foreground font-medium">Carregando faturas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-background min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Faturas</h1>
                    <p className="text-muted-foreground text-lg mt-1">Gerencie todas as faturas e cobranças do sistema</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-card overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-info rounded-xl">
                                    <FileText className="h-6 w-6 text-link" />
                                </div>
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.total}</div>
                            <p className="text-sm text-muted-foreground font-medium">Total de Faturas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-card overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-success rounded-xl">
                                    <CheckCircle className="h-6 w-6 text-success-foreground" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.paid}</div>
                            <p className="text-sm text-muted-foreground font-medium">Faturas Pagas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-card overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-warning rounded-xl">
                                    <Clock className="h-6 w-6 text-warning-foreground" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.open}</div>
                            <p className="text-sm text-muted-foreground font-medium">Faturas Abertas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-card overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-danger rounded-xl">
                                    <AlertCircle className="h-6 w-6 text-danger-foreground" />
                                </div>
                                {stats.overdue > 0 && (
                                    <Badge className="bg-danger text-danger-foreground">Urgente</Badge>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.overdue}</div>
                            <p className="text-sm text-muted-foreground font-medium">Faturas Vencidas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-card rounded-2xl">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por cliente ou descrição..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 border-2 border-input rounded-xl focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-foreground-subtle"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-56 h-12 border-2 border-input rounded-xl focus:border-ring focus:ring-2 focus:ring-ring/20">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas ({stats.total})</SelectItem>
                                    <SelectItem value="ABERTA">Abertas ({stats.open})</SelectItem>
                                    <SelectItem value="PAGA">Pagas ({stats.paid})</SelectItem>
                                    <SelectItem value="VENCIDA">Vencidas ({stats.overdue})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices Table */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-card rounded-2xl">
                    <CardHeader className="border-b border-border bg-muted">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-foreground">Lista de Faturas</CardTitle>
                            <Badge className="bg-muted text-foreground hover:bg-muted">
                                {filteredInvoices.length} {filteredInvoices.length === 1 ? 'fatura' : 'faturas'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {filteredInvoices.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="font-bold text-foreground">ID</TableHead>
                                            <TableHead className="font-bold text-foreground">Cliente</TableHead>
                                            <TableHead className="font-bold text-foreground">Tipo</TableHead>
                                            <TableHead className="font-bold text-foreground">Vencimento</TableHead>
                                            <TableHead className="font-bold text-foreground">Valor</TableHead>
                                            <TableHead className="font-bold text-foreground">Status</TableHead>
                                            <TableHead className="text-right font-bold text-foreground">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.map((invoice) => {
                                            const StatusIcon = statusConfig[invoice.status]?.icon || FileText;
                                            return (
                                                <TableRow
                                                    key={invoice.id}
                                                    className="hover:bg-muted transition-colors border-border"
                                                >
                                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                                        #{invoice.id}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-foreground">
                                                        {invoice.client?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-medium border-border">
                                                            {typeConfig[invoice.type] || invoice.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-foreground">
                                                        {formatCurrency(invoice.amountCents)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={`rounded-full font-semibold shadow-sm ${statusConfig[invoice.status]?.bgColor} ${statusConfig[invoice.status]?.textColor}`}
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
                                                                className="h-9 hover:bg-info hover:text-link rounded-lg"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1.5" />
                                                                Ver
                                                            </Button>
                                                            {invoice.status !== 'PAGA' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openPaymentModal(invoice)}
                                                                    className="h-9 hover:bg-success hover:text-success-foreground rounded-lg"
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
                                <div className="p-4 bg-muted rounded-full mb-4">
                                    <FileText className="h-12 w-12 text-foreground-subtle" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma fatura encontrada</h3>
                                <p className="text-muted-foreground">
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
                            <div className="p-2 bg-success rounded-full">
                                <CheckCircle className="h-6 w-6 text-success-foreground" />
                            </div>
                            Marcar como Paga
                        </DialogTitle>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6">
                            <div className="bg-muted border-2 border-border p-4 rounded-xl space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Cliente:</span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {selectedInvoice.client?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Valor:</span>
                                    <span className="text-lg font-bold text-success-foreground">
                                        {formatCurrency(selectedInvoice.amountCents)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Vencimento:</span>
                                    <span className="text-sm font-medium">
                                        {new Date(selectedInvoice.dueDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Data do Pagamento <span className="text-danger-foreground">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="h-12 border-2 border-input rounded-xl"
                                />
                                <p className="text-xs text-muted-foreground">Informe quando o pagamento foi realizado</p>
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
                                    className="flex-1 h-12 rounded-xl bg-success text-success-foreground hover:bg-success/90 shadow-lg"
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
                            <div className="p-2 bg-info rounded-full">
                                <FileText className="h-6 w-6 text-link" />
                            </div>
                            Fatura #{selectedInvoice?.id}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <Card className="border-2 border-border rounded-xl">
                                <CardHeader className="bg-muted border-b border-border">
                                    <CardTitle className="text-lg font-bold">Informações Básicas</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Cliente</p>
                                            <p className="font-semibold text-foreground">
                                                {selectedInvoice.client?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Tipo</p>
                                            <Badge variant="outline" className="font-semibold">
                                                {typeConfig[selectedInvoice.type] || selectedInvoice.type}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Valor Total</p>
                                            <p className="font-bold text-2xl text-link">
                                                {formatCurrency(selectedInvoice.amountCents)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                                            <Badge
                                                className={`rounded-full font-semibold ${statusConfig[selectedInvoice.status]?.bgColor} ${statusConfig[selectedInvoice.status]?.textColor}`}
                                            >
                                                {statusConfig[selectedInvoice.status]?.label}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Emissão</p>
                                            <p className="font-medium">
                                                {new Date(selectedInvoice.issueDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">Vencimento</p>
                                            <p className="font-medium">
                                                {new Date(selectedInvoice.dueDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        {selectedInvoice.paidAt && (
                                            <div className="md:col-span-2 space-y-1">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                                    Pago Em
                                                </p>
                                                <p className="font-semibold text-success-foreground">
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
                                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                                    Descrição
                                                </p>
                                                <div className="text-sm text-foreground space-y-1">
                                                    {selectedInvoice.description.split(' | ').map((line: string, i: number) => (
                                                        <p key={i} className={i === 0 ? 'font-semibold' : ''}>
                                                            {line}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Link Principal de Pagamento */}
                            {selectedInvoice.invoiceUrl && (
                                <Card className="border-2 border-success-border bg-gradient-to-br from-success/40 to-card rounded-xl">
                                    <CardHeader className="border-b border-success-border">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-success-foreground" />
                                            Link de Pagamento Completo
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Acesse o link abaixo para escolher entre PIX, Boleto ou Cartão de Crédito:
                                        </p>
                                        <Button asChild className="w-full h-12 bg-success text-success-foreground hover:bg-success/90 shadow-lg">
                                            <a href={selectedInvoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Acessar Página de Pagamento
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Boleto */}
                            {selectedInvoice.boletoBarcode && (
                                <Card className="border-2 border-warning-border bg-gradient-to-br from-warning/40 to-card rounded-xl">
                                    <CardHeader className="border-b border-warning-border">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-warning-foreground" />
                                            Boleto Bancário
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                                                Código de Barras
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 p-3 bg-card border-2 border-warning-border rounded-lg text-sm font-mono overflow-x-auto">
                                                    {selectedInvoice.boletoBarcode}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCopy(selectedInvoice.boletoBarcode, 'boleto')}
                                                    className="border-2 border-warning-border hover:bg-warning h-12 px-4"
                                                >
                                                    {copiedField === 'boleto' ? (
                                                        <Check className="h-4 w-4 text-success-foreground" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        {selectedInvoice.bankSlipUrl && (
                                            <Button asChild className="w-full h-12 bg-warning text-warning-foreground hover:bg-warning/90 shadow-lg">
                                                <a href={selectedInvoice.bankSlipUrl} target="_blank" rel="noopener noreferrer">
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Baixar Boleto em PDF
                                                </a>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* PIX */}
                            {selectedInvoice.pixCopyPaste && (
                                <Card className="border-2 border-info-border bg-gradient-to-br from-info/40 to-card rounded-xl">
                                    <CardHeader className="border-b border-info-border">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Smartphone className="h-5 w-5 text-info-foreground" />
                                            PIX
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        {selectedInvoice.pixQrCodeUrl && (
                                            <div className="flex justify-center">
                                                <div className="p-4 bg-white rounded-xl border-2 border-info-border">
                                                    <img
                                                        src={selectedInvoice.pixQrCodeUrl}
                                                        alt="QR Code PIX"
                                                        className="w-48 h-48"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-2">Copia e Cola</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 p-3 bg-card border-2 border-info-border rounded-lg text-xs font-mono break-all overflow-x-auto max-h-20">
                                                    {selectedInvoice.pixCopyPaste}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCopy(selectedInvoice.pixCopyPaste, 'pix')}
                                                    className="border-2 border-info-border hover:bg-info h-12 px-4"
                                                >
                                                    {copiedField === 'pix' ? (
                                                        <Check className="h-4 w-4 text-success-foreground" />
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
