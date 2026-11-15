'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Calendar, KanbanSquare } from 'lucide-react';
import { authService } from '@/services/auth';
import { projectsService, Project } from '@/services/api/projects';
import { clientsService } from '@/services/crud';
import axios from 'axios';

interface Client {
    id: number;
    name: string;
}

export default function ProjetosPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        loadData();
    }, [router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [projectsData, clientsResponse] = await Promise.all([
                projectsService.getAll(),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/clientes`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: [] }))
            ]);

            setProjects(Array.isArray(projectsData) ? projectsData.sort((a: any, b: any) => b.id - a.id) : []);
            setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data : []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PLANNING':
                return <Badge className="bg-info text-info-foreground hover:bg-blue-200 border-0">Planejamento</Badge>;
            case 'ACTIVE':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Ativo</Badge>;
            case 'ON_HOLD':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Pausado</Badge>;
            case 'COMPLETED':
                return <Badge className="bg-muted text-foreground hover:bg-muted border-0">Concluído</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-danger text-danger-foreground hover:bg-red-200 border-0">Cancelado</Badge>;
            default:
                return <Badge className="bg-muted text-foreground hover:bg-muted border-0">{status}</Badge>;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getClientName = (clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : '-';
    };

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Projetos</h1>
                    <p className="text-muted-foreground mt-2">Gerencie e acompanhe todos os projetos da empresa.</p>
                </div>

            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-card">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
                            <Input
                                placeholder="Buscar projetos por nome ou descrição..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-muted/50 border-input h-11"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-muted/50 border-input h-11">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="PLANNING">Planejamento</SelectItem>
                                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                                    <SelectItem value="ON_HOLD">Pausado</SelectItem>
                                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Projects List */}
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-card">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                                    <TableHead className="font-semibold text-foreground h-12 px-6">Nome</TableHead>
                                    <TableHead className="font-semibold text-foreground h-12">Cliente</TableHead>
                                    <TableHead className="font-semibold text-foreground h-12">Status</TableHead>
                                    <TableHead className="font-semibold text-foreground h-12">Data de Início</TableHead>
                                    <TableHead className="font-semibold text-foreground h-12 text-right px-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                                                <p>Carregando projetos...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            Nenhum projeto encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <TableRow
                                            key={project.id}
                                            className="hover:bg-muted/50 border-b border-border cursor-pointer transition-colors"
                                            onClick={() => router.push(`/client/projetos/${project.id}`)}
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{project.name}</span>
                                                    {project.description && (
                                                        <span className="text-sm text-muted-foreground break-words">{project.description}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-sm text-muted-foreground">
                                                    {/* We cast to any here just to gracefully handle if API returns clientId in project */}
                                                    {(project as any).clientId ? getClientName((project as any).clientId) : '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(project.status)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="mr-2 h-4 w-4 text-foreground-subtle" />
                                                    {formatDate(project.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-primary hover:bg-info"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/client/projetos/${project.id}`);
                                                    }}
                                                >
                                                    <KanbanSquare className="mr-2 h-4 w-4" />
                                                    Quadro Kanban
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}
