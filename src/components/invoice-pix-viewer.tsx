'use client';

import { useState, useEffect } from 'react';
import { QrCode, Copy, Check, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { invoicesService } from '@/services/crud';
import { toast } from 'sonner';

interface InvoicePixViewerProps {
    invoiceId: number;
    invoice?: any; // Dados da fatura (opcional, será buscado se não fornecido)
}

export function InvoicePixViewer({ invoiceId, invoice: initialInvoice }: InvoicePixViewerProps) {
    const [invoice, setInvoice] = useState(initialInvoice);
    const [pixData, setPixData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Resetar estados quando trocar de fatura
        setPixData(null);
        setInvoice(initialInvoice);

        // Carregar dados
        if (invoiceId) {
            loadInvoiceAndPix();
        }
    }, [invoiceId]); // Recarrega quando trocar de fatura

    const loadInvoiceAndPix = async () => {
        setLoading(true);
        try {
            // Buscar dados da fatura se não foi fornecida
            let invoiceData = initialInvoice;
            if (!invoiceData) {
                invoiceData = await invoicesService.getById(invoiceId);
                setInvoice(invoiceData);
            }

            // Buscar dados do PIX
            try {
                const pixInfo = await invoicesService.getPixData(invoiceId);

                // Se retornou dados do PIX, usar
                if (pixInfo && (pixInfo.pixQrCode || pixInfo.hasPixGenerated)) {
                    setPixData(pixInfo);
                } else {
                    // Se não tem PIX, gerar automaticamente
                    await autoGeneratePix();
                }
            } catch (error: any) {
                // Se não encontrar PIX ou der erro, gerar automaticamente
                console.log('PIX não encontrado, gerando automaticamente...');
                await autoGeneratePix();
            }
        } catch (error: any) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados da fatura');
        } finally {
            setLoading(false);
        }
    };

    const autoGeneratePix = async () => {
        try {
            const result = await invoicesService.generatePix(invoiceId);
            setPixData({
                ...result,
                hasPixGenerated: true,
                invoiceId: invoiceId,
            });
            console.log('✅ PIX gerado automaticamente');
        } catch (error: any) {
            console.error('Erro ao gerar PIX automaticamente:', error);
            // Não mostrar toast de erro, apenas log
        }
    };

    const handleGeneratePix = async () => {
        setGenerating(true);
        try {
            const result = await invoicesService.generatePix(invoiceId);
            setPixData({
                ...result,
                hasPixGenerated: true,
                invoiceId: invoiceId,
            });
            toast.success('PIX gerado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao gerar PIX:', error);
            toast.error(error.response?.data?.message || 'Erro ao gerar PIX');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopyPix = async () => {
        if (pixData?.pixQrCode) {
            try {
                await navigator.clipboard.writeText(pixData.pixQrCode);
                setCopied(true);
                toast.success('Código PIX copiado!');

                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                toast.error('Erro ao copiar código');
            }
        }
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
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            open: 'Em Aberto',
            paid: 'Pago',
            overdue: 'Vencido',
            void: 'Cancelado',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Informações da Fatura - Compacto */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4 rounded-xl">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Valor</p>
                        <p className="font-bold text-lg text-green-600">
                            {formatCurrency(invoice?.amountCents || pixData?.amount * 100 || 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Vencimento</p>
                        <p className="font-semibold text-sm">
                            {invoice?.dueDate
                                ? new Date(invoice.dueDate).toLocaleDateString('pt-BR')
                                : pixData?.dueDate
                                    ? new Date(pixData.dueDate).toLocaleDateString('pt-BR')
                                    : 'N/A'
                            }
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <Badge className={`${getStatusColor(invoice?.status)} text-white text-xs`}>
                            {getStatusLabel(invoice?.status)}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* PIX Payment - Compacto */}
            {loading || (!pixData?.pixQrCode && !pixData?.pixQrCodeImage) ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                    <QrCode className="w-12 h-12 mx-auto text-gray-300 mb-3 animate-pulse" />
                    <p className="text-gray-600 text-sm">
                        {loading ? 'Carregando dados PIX...' : 'Gerando PIX automaticamente...'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* QR Code - Tamanho reduzido */}
                    {pixData?.pixQrCodeImage && (
                        <div className="flex justify-center bg-white p-3 rounded-xl border border-gray-200">
                            <img
                                src={pixData.pixQrCodeImage}
                                alt="QR Code PIX"
                                className="w-48 h-48"
                            />
                        </div>
                    )}

                    {/* Código Copia e Cola - Compacto */}
                    {pixData?.pixQrCode && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">
                                Código Copia e Cola
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                    {pixData.pixQrCode.substring(0, 40)}...
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyPix}
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Instruções - Compactas */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Como pagar:</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-xs text-blue-800">
                            <li>Abra o app do seu banco</li>
                            <li>Escolha PIX → Ler QR Code ou Copia e Cola</li>
                            <li>Confirme o pagamento</li>
                        </ol>
                    </div>

                    {/* Info adicional pequena */}
                    {pixData?.alreadyExists && (
                        <p className="text-xs text-center text-blue-600">
                            ✓ PIX já gerado anteriormente
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
