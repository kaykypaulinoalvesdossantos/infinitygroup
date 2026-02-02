'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    FileText,
    Download,
    Eye,
    Upload,
    Search,
    Plus,
    Loader2,
    Filter,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { authService } from '@/services/auth';
import { apiRequest } from '@/services/api';

export default function ContratosPage() {
    const router = useRouter();
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        loadContracts();
    }, [router]);

    const loadContracts = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/contract-files', {
                method: 'GET',
            });
            setContracts(data);
        } catch (error) {
            console.error('Error loading contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredContracts = contracts.filter((contract) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            contract.fileName?.toLowerCase().includes(search) ||
            contract.fileType?.toLowerCase().includes(search) ||
            contract.subscription?.client?.name?.toLowerCase().includes(search)
        );
    });

    // Estatísticas
    const stats = {
        total: contracts.length,
        active: contracts.filter((c) => c.subscription?.status === 'active').length,
        pending: contracts.filter((c) => !c.filePath).length,
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#0076FF]" />
                    <p className="text-[#64748B] font-medium">Carregando contratos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A]">Contratos</h1>
                        <p className="text-[#64748B] text-lg mt-1">
                            Gerencie todos os contratos e documentos dos clientes
                        </p>
                    </div>
                    <Button className="bg-[#0076FF] text-white hover:bg-[#0060D0] h-12 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold" onClick={() => router.push('/admin/contratos/novo')}>
                        <Plus className="h-5 w-5 mr-2" />
                        Novo Contrato
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl">
                                    <FileText className="h-6 w-6 text-[#0076FF]" />
                                </div>
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.total}</div>
                            <p className="text-sm text-[#64748B] font-medium">Total de Contratos</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-emerald-50 rounded-xl">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.active}</div>
                            <p className="text-sm text-[#64748B] font-medium">Contratos Ativos</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-orange-50 rounded-xl">
                                    <AlertCircle className="h-6 w-6 text-orange-600" />
                                </div>
                                {stats.pending > 0 && (
                                    <Badge className="bg-orange-500 hover:bg-orange-500 text-white">
                                        Atenção
                                    </Badge>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.pending}</div>
                            <p className="text-sm text-[#64748B] font-medium">Pendentes de Upload</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros e Busca */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#64748B]" />
                                <Input
                                    placeholder="Buscar por cliente, arquivo ou tipo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabela de Contratos */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A]">
                                Lista de Contratos
                            </CardTitle>
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                                {filteredContracts.length} {filteredContracts.length === 1 ? 'contrato' : 'contratos'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {filteredContracts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200">
                                            <TableHead className="font-bold text-[#1A1A1A]">Cliente</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Arquivo</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Tipo</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Status</TableHead>
                                            <TableHead className="font-bold text-[#1A1A1A]">Data Upload</TableHead>
                                            <TableHead className="text-right font-bold text-[#1A1A1A]">
                                                Ações
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredContracts.map((contract) => (
                                            <TableRow
                                                key={contract.id}
                                                className="hover:bg-slate-50 transition-colors border-slate-100"
                                            >
                                                <TableCell className="font-semibold text-[#1A1A1A]">
                                                    {contract.subscription?.client?.name || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-[#0076FF]" />
                                                        <span className="text-sm text-[#64748B] font-medium">
                                                            {contract.fileName || 'Sem arquivo'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="capitalize font-semibold border-slate-300"
                                                    >
                                                        {contract.mimeType?.split('/')[1] || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {contract.storageKey ? (
                                                        <Badge className="rounded-full bg-emerald-500 hover:bg-emerald-500 text-white font-semibold shadow-sm">
                                                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                            Anexado
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="rounded-full bg-orange-500 hover:bg-orange-500 text-white font-semibold shadow-sm">
                                                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                            Pendente
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                                                        <Calendar className="h-4 w-4" />
                                                        {contract.uploadedAt
                                                            ? new Date(contract.uploadedAt).toLocaleDateString(
                                                                'pt-BR'
                                                            )
                                                            : '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {contract.storageKey ? (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-9 hover:bg-blue-50 hover:text-[#0076FF] rounded-lg"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1.5" />
                                                                    Ver
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-9 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg"
                                                                >
                                                                    <Download className="h-4 w-4 mr-1.5" />
                                                                    Baixar
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-9 hover:bg-orange-50 hover:text-orange-600 rounded-lg"
                                                            >
                                                                <Upload className="h-4 w-4 mr-1.5" />
                                                                Upload
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 bg-slate-100 rounded-full mb-4">
                                    <FileText className="h-12 w-12 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                                    Nenhum contrato encontrado
                                </h3>
                                <p className="text-[#64748B] mb-6 max-w-md">
                                    {searchTerm
                                        ? 'Tente ajustar os filtros ou buscar por outro termo'
                                        : 'Comece adicionando um novo contrato para seus clientes'}
                                </p>
                                <Button className="bg-[#0076FF] text-white hover:bg-[#0060D0] rounded-xl shadow-lg" onClick={() => router.push('/admin/contratos/novo')}>
                                    <Plus className="h-5 w-5 mr-2" />
                                    Adicionar Contrato
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
