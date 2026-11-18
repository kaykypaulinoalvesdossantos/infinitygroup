'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, FileText, TrendingUp, TrendingDown, AlertCircle, ArrowRight, Eye, Copy, Check, CreditCard, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { authService } from '@/services/auth';
import { dashboardService } from '@/services/dashboard';
import { invoicesService } from '@/services/crud';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [productDistribution, setProductDistribution] = useState<any[]>([]);
    const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
    const [upcomingSubscriptions, setUpcomingSubscriptions] = useState<any[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        const userData = authService.getCurrentUser();
        setUser(userData);
        loadDashboardData();
    }, [router]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [metricsData, revenueChart, productDist, overdue, upcoming] = await Promise.all([
                dashboardService.getMetrics(),
                dashboardService.getRevenueChart(),
                dashboardService.getProductDistribution(),
                dashboardService.getOverdueInvoices(),
                dashboardService.getUpcomingSubscriptions(),
            ]);

            setMetrics(metricsData);
            setRevenueData(revenueChart);
            setProductDistribution(productDist);
            setOverdueInvoices(overdue);
            setUpcomingSubscriptions(upcoming);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
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

    const openDetails = async (invoiceId: number) => {
        try {
            // Buscar detalhes completos da fatura
            const fullInvoice = await invoicesService.getById(invoiceId);
            setSelectedInvoice(fullInvoice);
            setDetailsOpen(true);
        } catch (error) {
            console.error('Error loading invoice details:', error);
        }
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100);
    };

    const statusConfig: Record<string, { label: string; variant: any; className: string }> = {
        open: { label: 'Aberta', variant: 'default', className: 'border border-warning-border bg-warning text-warning-foreground' },
        paid: { label: 'Paga', variant: 'secondary', className: 'border border-success-border bg-success text-success-foreground' },
        overdue: { label: 'Vencida', variant: 'destructive', className: 'border border-danger-border bg-danger text-danger-foreground' },
    };

    const typeConfig: Record<string, string> = {
        implementation: 'Implementação',
        monthly: 'Mensalidade',
        additional: 'Adicional',
    };

    const productTypeConfig: Record<string, string> = {
        SITE: 'Site',
        PROJETOS: 'Projetos',
        SISTEMAS: 'Sistemas',
        AUTOMACAO: 'Automação',
        CELULAR: 'Celular',
        ECOMMERCE: 'e-Commerce',
        CRM_TELECOM: 'CRM Telecom',
        OTHER: 'Outros',
    };

    if (!user || loading) {
        return (
            <div className="flex h-full items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="mt-3 font-medium text-muted-foreground">Carregando dados...</p>
                </div>
            </div>
        );
    }

    const maxRevenue = Math.max(0, ...revenueData.map((item) => item.value)) || 1;

    return (
        <div className="min-h-full">
            <div className="admin-page">
                {/* Page Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Visão geral</h1>
                    <p className="text-sm text-muted-foreground">Clientes, receita e próximos vencimentos.</p>
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="gap-2 py-4 shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4">
                            <CardTitle className="text-sm font-medium leading-snug text-muted-foreground">
                                Clientes ativos
                            </CardTitle>
                            <div className="shrink-0 rounded-lg bg-info p-2">
                                <Users aria-hidden className="h-4 w-4 text-link" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4">
                            <div className="text-2xl font-semibold tabular-nums text-foreground">{metrics.activeClients || 0}</div>
                            <div className="text-xs text-muted-foreground">
                                Clientes pagantes ativos
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-2 py-4 shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4">
                            <CardTitle className="text-sm font-medium leading-snug text-muted-foreground">
                                Receita mensal
                            </CardTitle>
                            <div className="shrink-0 rounded-lg bg-success p-2">
                                <DollarSign aria-hidden className="h-4 w-4 text-success-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4">
                            <div className="text-2xl font-semibold tabular-nums text-foreground">R$ {metrics.mrr?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}</div>
                            <div className="text-xs text-muted-foreground">
                                Faturamento mensal recorrente
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-2 py-4 shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4">
                            <CardTitle className="text-sm font-medium leading-snug text-muted-foreground">
                                Faturas em aberto
                            </CardTitle>
                            <div className="shrink-0 rounded-lg bg-warning p-2">
                                <FileText aria-hidden className="h-4 w-4 text-warning-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4">
                            <div className="text-2xl font-semibold tabular-nums text-foreground">{metrics.openInvoicesCount || 0}</div>
                            <div className="text-xs text-muted-foreground">
                                Valor: <span className="font-bold text-warning-foreground">R$ {metrics.totalOpenInvoices?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-2 py-4 shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4">
                            <CardTitle className="text-sm font-medium leading-snug text-muted-foreground">
                                Taxa de inadimplência
                            </CardTitle>
                            <div className="shrink-0 rounded-lg bg-danger p-2">
                                <AlertCircle aria-hidden className="h-4 w-4 text-danger-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4">
                            <div className="text-2xl font-semibold tabular-nums text-foreground">{metrics.defaultRate || 0}%</div>
                            <div className="text-xs text-muted-foreground">
                                Faturas vencidas vs pagas
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid items-start gap-4 lg:grid-cols-2">
                    {/* Revenue Chart */}
                    <Card className="gap-0 overflow-hidden py-0 shadow-none">
                        <CardHeader className="py-4">
                            <CardTitle className="text-xl font-bold text-foreground">
                                Receita dos últimos 6 meses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-5">
                            <div className="space-y-3">
                                {revenueData.map((item) => {
                                    const percentage = Math.max(0, (item.value / maxRevenue) * 100);
                                    const formattedValue = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.value);

                                    return (
                                        <div key={item.month} className="grid grid-cols-[2rem_minmax(0,1fr)_minmax(6rem,auto)] items-center gap-3 text-sm">
                                            <span className="text-muted-foreground">{item.month}</span>
                                            <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                                                <div className="h-full rounded-full bg-primary" style={{ width: percentage + "%" }} />
                                            </div>
                                            <span className="text-right font-semibold tabular-nums text-foreground">{formattedValue}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Distribution Chart */}
                    <Card className="gap-0 overflow-hidden py-0 shadow-none">
                        <CardHeader className="py-4">
                            <CardTitle className="text-xl font-bold text-foreground">
                                Distribuição por serviço ou produto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-5">
                            <div className="space-y-4">
                                {productDistribution.length > 0 ? productDistribution.map((item) => {
                                    const label = productTypeConfig[item.name] || item.name;
                                    return (
                                        <div key={item.name} className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-foreground">{label}</span>
                                                <span className="text-sm font-semibold tabular-nums text-foreground">{item.value}%</span>
                                            </div>
                                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{ width: `${item.value}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center text-muted-foreground py-8 bg-muted rounded-xl border-2 border-dashed border-border">
                                        <FileText className="h-12 w-12 mx-auto mb-3 text-foreground-subtle" />
                                        <p className="font-medium">Sem dados disponíveis</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Overdue Invoices Table */}
                <Card className="gap-0 overflow-hidden py-0 shadow-none">
                    <CardHeader className="py-4">
                        <CardTitle className="text-xl font-bold text-foreground">
                            Faturas vencidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/45 hover:bg-muted/45">
                                        <TableHead className="font-bold text-foreground">Cliente</TableHead>
                                        <TableHead className="font-bold text-foreground">Valor</TableHead>
                                        <TableHead className="font-bold text-foreground">Vencimento</TableHead>
                                        <TableHead className="font-bold text-foreground">Dias de atraso</TableHead>
                                        <TableHead className="text-right font-bold text-foreground">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {overdueInvoices.length === 0 && (
                                        <TableRow className="hover:bg-transparent"><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Nenhuma fatura vencida.</TableCell></TableRow>
                                    )}
                                    {overdueInvoices.map((invoice) => (
                                        <TableRow key={invoice.id} className="hover:bg-muted transition-colors border-b border-border">
                                            <TableCell className="font-semibold text-foreground">{invoice.client}</TableCell>
                                            <TableCell className="font-bold text-success-foreground">
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }).format(invoice.value)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive" className="rounded-full px-3 py-1 font-semibold shadow-sm">
                                                    {invoice.daysOverdue} dias
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => openDetails(invoice.id)}
                                                    variant="outline"
                                                >
                                                    Ver fatura
                                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Subscriptions Table */}
                <Card className="gap-0 overflow-hidden py-0 shadow-none">
                    <CardHeader className="py-4">
                        <CardTitle className="text-xl font-bold text-foreground">
                            Assinaturas próximas do vencimento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/45 hover:bg-muted/45">
                                        <TableHead className="font-bold text-foreground">Cliente</TableHead>
                                        <TableHead className="font-bold text-foreground">Produto</TableHead>
                                        <TableHead className="font-bold text-foreground">Próxima cobrança</TableHead>
                                        <TableHead className="text-right font-bold text-foreground">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingSubscriptions.length === 0 && (
                                        <TableRow className="hover:bg-transparent"><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Nenhuma assinatura próxima do vencimento.</TableCell></TableRow>
                                    )}
                                    {upcomingSubscriptions.map((subscription) => (
                                        <TableRow key={subscription.id} className="hover:bg-muted transition-colors border-b border-border">
                                            <TableCell className="font-semibold text-foreground">{subscription.client}</TableCell>
                                            <TableCell className="text-muted-foreground font-medium">{subscription.product}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(subscription.nextCharge).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell className="font-bold text-success-foreground text-right">
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }).format(subscription.value)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <FileText className="h-6 w-6 text-link" />
                            Fatura #{selectedInvoice?.id}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6">
                            {/* Basic Info Card */}
                            <Card className="border-border">
                                <CardHeader>
                                    <CardTitle className="text-lg">Informações Básicas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Cliente</p>
                                            <p className="font-medium text-foreground">
                                                {selectedInvoice.client?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tipo</p>
                                            <p className="font-medium text-foreground">
                                                {typeConfig[selectedInvoice.type] || selectedInvoice.type}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Valor Total</p>
                                            <p className="font-bold text-xl text-link">
                                                {formatCurrency(selectedInvoice.amountCents)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Status</p>
                                            <Badge
                                                variant={statusConfig[selectedInvoice.status]?.variant}
                                                className={`${statusConfig[selectedInvoice.status]?.className} rounded-full`}
                                            >
                                                {statusConfig[selectedInvoice.status]?.label}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Data de Emissão</p>
                                            <p className="font-medium">
                                                {new Date(selectedInvoice.issueDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Vencimento</p>
                                            <p className="font-medium">
                                                {new Date(selectedInvoice.dueDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        {selectedInvoice.paidAt && (
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-muted-foreground">Pago em</p>
                                                <p className="font-medium text-success-foreground">
                                                    {new Date(selectedInvoice.paidAt).toLocaleDateString('pt-BR')} às{' '}
                                                    {new Date(selectedInvoice.paidAt).toLocaleTimeString('pt-BR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {selectedInvoice.description && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Descrição</p>
                                            <p className="font-medium text-foreground">{selectedInvoice.description}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Boleto Information */}
                            {selectedInvoice.boletoBarcode && (
                                <Card className="border-border bg-gradient-to-br from-warning/40 to-card">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-warning-foreground" />
                                            Boleto Bancário
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Código de Barras</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 p-3 bg-card border border-warning-border rounded-xl text-sm font-mono">
                                                    {selectedInvoice.boletoBarcode}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleCopy(selectedInvoice.boletoBarcode, 'boleto')
                                                    }
                                                    className="border-warning-border hover:bg-warning rounded-xl"
                                                >
                                                    {copiedField === 'boleto' ? (
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

                            {/* PIX Information */}
                            {selectedInvoice.pixCopyPaste && (
                                <Card className="border-border bg-gradient-to-br from-info/40 to-card">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Smartphone className="h-5 w-5 text-info-foreground" />
                                            PIX
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {selectedInvoice.pixQrCodeUrl && (
                                            <div className="flex justify-center">
                                                <div className="p-4 bg-white rounded-xl border-2 border-info-border shadow-md">
                                                    <img
                                                        src={selectedInvoice.pixQrCodeUrl}
                                                        alt="QR Code PIX"
                                                        className="w-48 h-48"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Copia e Cola</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 p-3 bg-card border border-info-border rounded-xl text-xs font-mono break-all">
                                                    {selectedInvoice.pixCopyPaste}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCopy(selectedInvoice.pixCopyPaste, 'pix')}
                                                    className="border-info-border hover:bg-info rounded-xl"
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
