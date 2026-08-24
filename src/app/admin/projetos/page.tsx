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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create Project Form State
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newClientId, setNewClientId] = useState('');
    const [isCreating, setIsCreating] = useState(false);

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
            const [projectsData, clientsData] = await Promise.all([
                projectsService.getAll(),
                clientsService.getAll()
            ]);

            setProjects(Array.isArray(projectsData) ? projectsData : []);
            setClients(Array.isArray(clientsData) ? clientsData : []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newName || !newClientId) return;

        try {
            setIsCreating(true);
            await projectsService.create({
                name: newName,
                description: newDescription,
                clientId: Number(newClientId),
                status: 'PLANNING'
            } as any); // cast as any because clientId isn't in the Project interface

            // Reset form and close modal
            setNewName('');
            setNewDescription('');
            setNewClientId('');
            setIsCreateModalOpen(false);

            // Reload projects
            await loadData();
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PLANNING':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Planejamento</Badge>;
            case 'ACTIVE':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Ativo</Badge>;
            case 'ON_HOLD':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Pausado</Badge>;
            case 'COMPLETED':
                return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">Concluído</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Cancelado</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">{status}</Badge>;
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
                    <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Projetos</h1>
                    <p className="text-slate-500 mt-2">Gerencie e acompanhe todos os projetos da empresa.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#0076FF] hover:bg-[#0060D0] text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Projeto
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar projetos por nome ou descrição..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-slate-50/50 border-slate-200 h-11"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-slate-50/50 border-slate-200 h-11">
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
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                                    <TableHead className="font-semibold text-slate-700 h-12 px-6">Nome</TableHead>
                                    <TableHead className="font-semibold text-slate-700 h-12">Cliente</TableHead>
                                    <TableHead className="font-semibold text-slate-700 h-12">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-700 h-12">Data de Início</TableHead>
                                    <TableHead className="font-semibold text-slate-700 h-12 text-right px-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[#0076FF]"></div>
                                                <p>Carregando projetos...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                            Nenhum projeto encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <TableRow
                                            key={project.id}
                                            className="hover:bg-slate-50/50 border-b border-slate-50 cursor-pointer transition-colors"
                                            onClick={() => router.push(`/admin/projetos/${project.id}`)}
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{project.name}</span>
                                                    {project.description && (
                                                        <span className="text-sm text-slate-500 line-clamp-1">{project.description}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-sm text-slate-600">
                                                    {/* We cast to any here just to gracefully handle if API returns clientId in project */}
                                                    {(project as any).clientId ? getClientName((project as any).clientId) : '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(project.status)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                                                    {formatDate(project.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-slate-500 hover:text-[#0076FF] hover:bg-blue-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/projetos/${project.id}`);
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

            {/* Create Project Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Novo Projeto</DialogTitle>
                        <DialogDescription>
                            Crie um novo projeto e associe-o a um cliente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Nome do Projeto <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ex: Website Institucional"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="client" className="text-sm font-medium">
                                Cliente <span className="text-red-500">*</span>
                            </label>
                            <Select value={newClientId} onValueChange={setNewClientId}>
                                <SelectTrigger id="client">
                                    <SelectValue placeholder="Selecione um cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Descrição
                            </label>
                            <Input
                                id="description"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Breve descrição do projeto"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={isCreating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateProject}
                            disabled={!newName || !newClientId || isCreating}
                            className="bg-[#0076FF] hover:bg-[#0060D0] text-white"
                        >
                            {isCreating ? 'Criando...' : 'Criar Projeto'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
