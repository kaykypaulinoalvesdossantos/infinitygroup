'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const paginatedClients = filteredClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, typeFilter, activeFilter]);

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

    const formatPhone = (phone: string | null) => {
        if (!phone) return '-';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        if (cleaned.length === 10) return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        return phone;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format((value || 0) / 100);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-input"></div>
                    <p className="mt-3 text-muted-foreground font-medium">Carregando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            <div className="admin-page">
                {/* Page Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Clientes</h1>
                    <p className="text-muted-foreground text-lg">Gerencie todos os seus clientes e suas informações</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-card rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-info rounded-xl group-hover:bg-info transition-colors">
                                    <Users className="h-5 w-5 text-link" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.total}</div>
                            <p className="text-sm text-muted-foreground font-medium">Total de Clientes</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-card rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-success rounded-xl group-hover:bg-success transition-colors">
                                    <Power className="h-5 w-5 text-success-foreground" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.active}</div>
                            <p className="text-sm text-muted-foreground font-medium">Ativos</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-card rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-muted rounded-xl group-hover:bg-muted transition-colors">
                                    <Power className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.inactive}</div>
                            <p className="text-sm text-muted-foreground font-medium">Inativos</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-card rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-info rounded-xl group-hover:bg-info/80 transition-colors">
                                    <User className="h-5 w-5 text-info-foreground" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.pf}</div>
                            <p className="text-sm text-muted-foreground font-medium">Pessoa Física</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1 bg-card rounded-2xl overflow-hidden group">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-warning rounded-xl group-hover:bg-warning transition-colors">
                                    <Building2 className="h-5 w-5 text-warning-foreground" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.pj}</div>
                            <p className="text-sm text-muted-foreground font-medium">Pessoa Jurídica</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="gap-0 py-0 shadow-none">
                    <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_auto] lg:items-end">
                        <div className="min-w-0 space-y-1.5 sm:col-span-2 lg:col-span-1">
                            <Label htmlFor="client-search">Buscar clientes</Label>
                            <div className="relative">
                                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="client-search" type="search" placeholder="Nome, e-mail ou documento" className="pl-9" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                            </div>
                        </div>
                        <div className="min-w-0 space-y-1.5">
                            <Label htmlFor="client-type">Tipo de cliente</Label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger id="client-type" className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os tipos</SelectItem>
                                    <SelectItem value="pf">Pessoa física</SelectItem>
                                    <SelectItem value="pj">Pessoa jurídica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-w-0 space-y-1.5">
                            <Label htmlFor="client-status">Situação</Label>
                            <Select value={activeFilter} onValueChange={setActiveFilter}>
                                <SelectTrigger id="client-status" className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as situações</SelectItem>
                                    <SelectItem value="active">Ativos</SelectItem>
                                    <SelectItem value="inactive">Inativos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => router.push('/admin/clientes/novo')} className="sm:col-span-2 lg:col-span-1">
                            <Plus className="h-4 w-4" aria-hidden />Novo cliente
                        </Button>
                    </CardContent>
                </Card>

                {/* Clients Table */}
                <Card className="gap-0 overflow-hidden py-0 shadow-none">
                    <CardHeader className="py-4">
                        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Users className="h-5 w-5 text-link" />
                            Clientes encontrados ({filteredClients.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/45 hover:bg-muted/45">
                                        <TableHead className="font-bold text-foreground py-3">Cliente</TableHead>
                                        <TableHead className="font-bold text-foreground">Tipo</TableHead>
                                        <TableHead className="font-bold text-foreground">Contato</TableHead>
                                        <TableHead className="font-bold text-foreground">Documento</TableHead>
                                        <TableHead className="font-bold text-foreground">Status</TableHead>
                                        <TableHead className="font-bold text-foreground">Total mensal</TableHead>
                                        <TableHead className="font-bold text-foreground">Próximo vencimento</TableHead>
                                        <TableHead className="font-bold text-foreground">Produtos</TableHead>
                                        <TableHead className="text-right font-bold text-foreground">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedClients.map((client) => (
                                        <TableRow key={client.id} className="hover:bg-muted/80 transition-colors border-b border-border">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-card shadow-md">
                                                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                                                            {getInitials(client.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-foreground">{client.name}</div>
                                                        <div className="text-xs text-muted-foreground">ID: #{client.id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`rounded-full px-3 py-1.5 font-semibold border-2 ${client.type === 'pf'
                                                            ? 'border-info-border bg-info text-info-foreground'
                                                            : 'border-warning-border bg-warning text-warning-foreground'
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
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                        <span className="truncate max-w-[200px]">{client.email || '-'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                                        <span>{formatPhone(client.phone)}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="font-mono text-sm text-muted-foreground">
                                                        {client.document || '-'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {client.active ? (
                                                    <Badge className="rounded-full px-3 py-1.5 font-semibold shadow-sm bg-success text-success-foreground border-0">
                                                        <span className="flex items-center gap-1.5">
                                                            <Power className="h-3.5 w-3.5" />
                                                            Ativo
                                                        </span>
                                                    </Badge>
                                                ) : (
                                                    <Badge className="rounded-full px-3 py-1.5 font-semibold shadow-sm bg-muted text-muted-foreground border border-border">
                                                        <span className="flex items-center gap-1.5">
                                                            <Power className="h-3.5 w-3.5" />
                                                            Inativo
                                                        </span>
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-foreground">
                                                    {formatCurrency(client.totalMonthlyValue)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Search className="h-3.5 w-3.5" />
                                                    {formatDate(client.nextDueDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="rounded-full bg-info text-link border-info-border hover:bg-info transition-colors">
                                                    {client.productCount || 0} Prod.
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => router.push(`/admin/clientes/${client.id}`)}
                                                        className="hover:bg-info hover:text-link rounded-lg transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1.5" />
                                                        Ver
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => router.push(`/admin/clientes/${client.id}/editar`)}
                                                        className="hover:bg-info hover:text-info-foreground rounded-lg transition-colors"
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
                                <div className="p-4 bg-muted rounded-full mb-4">
                                    <Users className="h-12 w-12 text-foreground-subtle" />
                                </div>
                                <p className="text-muted-foreground text-lg font-medium mb-1">Nenhum cliente encontrado</p>
                                <p className="text-muted-foreground text-sm">
                                    Tente ajustar os filtros ou criar um novo cliente
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredClients.length > 0 && (
                            <div className="px-6 py-4 flex items-center justify-between border-t border-border bg-muted/50">
                                <div className="text-sm text-muted-foreground font-medium">
                                    Mostrando <span className="text-foreground font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, filteredClients.length)}</span> de <span className="text-foreground font-bold">{filteredClients.length}</span> clientes
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        className="rounded-xl border-border hover:bg-card hover:text-link disabled:opacity-50 transition-all font-medium"
                                    >
                                        Anterior
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                // Show first, last, and pages around current
                                                return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                                            })
                                            .map((page, index, array) => (
                                                <div key={page} className="flex items-center">
                                                    {index > 0 && array[index - 1] !== page - 1 && (
                                                        <span className="px-2 text-foreground-subtle">...</span>
                                                    )}
                                                    <Button
                                                        variant={currentPage === page ? "default" : "ghost"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-9 h-9 p-0 rounded-xl transition-all font-bold ${
                                                            currentPage === page 
                                                                ? "bg-primary text-primary-foreground shadow-md shadow-blue-500/20"
                                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        }`}
                                                    >
                                                        {page}
                                                    </Button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        className="rounded-xl border-border hover:bg-card hover:text-link disabled:opacity-50 transition-all font-medium"
                                    >
                                        Próximo
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
