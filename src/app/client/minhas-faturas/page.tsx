'use client';

import { useState, useEffect } from 'react';
import { FileText, Eye, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { InvoicePixViewer } from '@/components/invoice-pix-viewer';
import { invoicesService } from '@/services/crud';
import { toast } from 'sonner';

export default function MinhasFaturasPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const data = await invoicesService.getMyInvoices();
            setInvoices(data);
        } catch (error) {
            console.error('Erro ao carregar faturas:', error);
            toast.error('Erro ao carregar faturas');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPixModal = (invoiceId: number) => {
        setSelectedInvoiceId(invoiceId);
        setIsPixModalOpen(true);
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-blue-500',
            paid: 'bg-green-500',
            overdue: 'bg-red-500',
            void: 'bg-gray-500',
            draft: 'bg-gray-400',
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            open: 'Em Aberto',
            paid: 'Pago',
            overdue: 'Vencido',
            void: 'Cancelado',
            draft: 'Rascunho',
        };
        return labels[status] || status;
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Faturas</h1>
                <p className="text-gray-600">
                    Visualize e pague suas faturas
                </p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando faturas...</p>
                </div>
            ) : invoices.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg mb-2">Nenhuma fatura encontrada</p>
                        <p className="text-gray-400 text-sm">
                            Suas faturas aparecerão aqui quando forem geradas
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Faturas</CardTitle>
                        <CardDescription>
                            Total de {invoices.length} fatura{invoices.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">
                                                #{invoice.id}
                                            </TableCell>
                                            <TableCell>
                                                {invoice.description}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {formatCurrency(invoice.amountCents)}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${getStatusColor(invoice.status)} text-white`}
                                                >
                                                    {getStatusLabel(invoice.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {invoice.status !== 'paid' && invoice.status !== 'void' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenPixModal(invoice.id)}
                                                        className="bg-[#FF6B35] hover:bg-[#ff5722]"
                                                    >
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        Pagar
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal de Pagamento PIX */}
            <Dialog open={isPixModalOpen} onOpenChange={setIsPixModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Pagamento via PIX</DialogTitle>
                        <DialogDescription>
                            Escaneie o QR Code ou copie o código para realizar o pagamento
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInvoiceId && (
                        <InvoicePixViewer invoiceId={selectedInvoiceId} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
