'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Eye, Edit, Power, Users, Mail, Phone, FileText, Building2, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { authService } from '@/services/auth';
import { clientsService } from '@/services/crud';

export default function ClientesPage() {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        loadClients();
    }, [router]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await clientsService.getAll();
            setClients(Array.isArray(data) ? data.sort((a: any, b: any) => b.id - a.id) : []);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter((client) => {
        const matchesSearch =
            client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.document?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
            typeFilter === 'all' || client.type === typeFilter;
        const matchesActive =
            activeFilter === 'all' ||
            (activeFilter === 'active' && client.active) ||
            (activeFilter === 'inactive' && !client.active);

        return matchesSearch && matchesType && matchesActive;
    });

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const stats = {
        total: clients.length,
        active: clients.filter(c => c.active).length,
        inactive: clients.filter(c => !c.active).length,
        pf: clients.filter(c => c.type === 'pf').length,
        pj: clients.filter(c => c.type === 'pj').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#0076FF]"></div>
                    <p className="mt-3 text-[#64748B] font-medium">Carregando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-full">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Page Title */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">Clientes</h1>
                    <p className="text-[#64748B] text-lg">Gerencie todos os seus clientes e suas informações</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                    <Users className="h-5 w-5 text-[#0076FF]" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.total}</div>
                            <p className="text-sm text-[#64748B] font-medium">Total de Clientes</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                    <Power className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.active}</div>
                            <p className="text-sm text-[#64748B] font-medium">Ativos</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                                    <Power className="h-5 w-5 text-slate-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.inactive}</div>
                            <p className="text-sm text-[#64748B] font-medium">Inativos</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                                    <User className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.pf}</div>
                            <p className="text-sm text-[#64748B] font-medium">Pessoa Física</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                                    <Building2 className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{stats.pj}</div>
                            <p className="text-sm text-[#64748B] font-medium">Pessoa Jurídica</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Search */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-1 gap-3 flex-wrap">
                                <div className="relative flex-1 min-w-[280px]">
                                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                                    <Input
                                        placeholder="Buscar por nome, email ou documento..."
                                        className="pl-11 h-12 border-slate-200 rounded-xl bg-white focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40 h-12 border-slate-200 rounded-xl bg-white">
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os tipos</SelectItem>
                                        <SelectItem value="pf">Pessoa Física</SelectItem>
                                        <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={activeFilter} onValueChange={setActiveFilter}>
                                    <SelectTrigger className="w-36 h-12 border-slate-200 rounded-xl bg-white">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="active">Ativos</SelectItem>
                                        <SelectItem value="inactive">Inativos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                className="bg-[#0076FF] hover:bg-[#0060D0] text-white h-12 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold group"
                                onClick={() => router.push('/admin/clientes/novo')}
                            >
                                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                                Novo Cliente
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Clients Table */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 pb-6">
                        <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                            <Users className="h-5 w-5 text-[#0076FF]" />
                            Lista de Clientes ({filteredClients.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                                        <TableHead className="font-bold text-[#1A1A1A] py-4">Cliente</TableHead>
                                        <TableHead className="font-bold text-[#1A1A1A]">Tipo</TableHead>
                                        <TableHead className="font-bold text-[#1A1A1A]">Contato</TableHead>
                                        <TableHead className="font-bold text-[#1A1A1A]">Documento</TableHead>
                                        <TableHead className="font-bold text-[#1A1A1A]">Status</TableHead>
                                        <TableHead className="text-right font-bold text-[#1A1A1A]">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClients.map((client) => (
                                        <TableRow key={client.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                                                        <AvatarFallback className="bg-gradient-to-br from-[#0076FF] to-[#00D4FF] text-white font-bold text-sm">
                                                            {getInitials(client.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-[#1A1A1A]">{client.name}</div>
                                                        <div className="text-xs text-[#64748B]">ID: #{client.id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`rounded-full px-3 py-1.5 font-semibold border-2 ${client.type === 'pf'
                                                            ? 'border-purple-300 bg-purple-50 text-purple-700'
                                                            : 'border-orange-300 bg-orange-50 text-orange-700'
                                                        }`}
                                                >
                                                    {client.type === 'pf' ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <User className="h-3.5 w-3.5" />
                                                            PF
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5">
                                                            <Building2 className="h-3.5 w-3.5" />
                                                            PJ
                                                        </span>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                                                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                        <span className="truncate max-w-[200px]">{client.email || '-'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                                                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                                        <span>{client.phone || '-'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-3.5 w-3.5 text-[#64748B]" />
                                                    <span className="font-mono text-sm text-[#64748B]">
                                                        {client.document || '-'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {client.active ? (
                                                    <Badge className="rounded-full px-3 py-1.5 font-semibold shadow-sm bg-emerald-500 hover:bg-emerald-500 text-white border-0">
                                                        <span className="flex items-center gap-1.5">
                                                            <Power className="h-3.5 w-3.5" />
                                                            Ativo
                                                        </span>
                                                    </Badge>
                                                ) : (
                                                    <Badge className="rounded-full px-3 py-1.5 font-semibold shadow-sm bg-slate-400 hover:bg-slate-400 text-white border-0">
                                                        <span className="flex items-center gap-1.5">
                                                            <Power className="h-3.5 w-3.5" />
                                                            Inativo
                                                        </span>
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => router.push(`/admin/clientes/${client.id}`)}
                                                        className="hover:bg-blue-50 hover:text-[#0076FF] rounded-lg transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1.5" />
                                                        Ver
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => router.push(`/admin/clientes/${client.id}/editar`)}
                                                        className="hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4 mr-1.5" />
                                                        Editar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredClients.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="p-4 bg-slate-100 rounded-full mb-4">
                                    <Users className="h-12 w-12 text-slate-400" />
                                </div>
                                <p className="text-[#64748B] text-lg font-medium mb-1">Nenhum cliente encontrado</p>
                                <p className="text-[#64748B] text-sm">
                                    Tente ajustar os filtros ou criar um novo cliente
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
