'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Eye, Edit, Trash, MoveRight, MoveLeft } from 'lucide-react';
import { authService } from '@/services/auth';
import { crmLeadsService, CrmLead } from '@/services/api/crm-leads';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const KANBAN_COLUMNS = [
  { id: 'NEW', title: 'Novo', color: 'bg-blue-100 text-blue-800' },
  { id: 'CONTACTED', title: 'Contactado', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'PROPOSAL', title: 'Proposta', color: 'bg-purple-100 text-purple-800' },
  { id: 'WON', title: 'Ganho', color: 'bg-green-100 text-green-800' },
  { id: 'LOST', title: 'Perdido', color: 'bg-red-100 text-red-800' }
] as const;

export default function CrmLeadsPage() {
    const router = useRouter();
    const [leads, setLeads] = useState<CrmLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        loadLeads();
    }, [router]);

    const loadLeads = async () => {
        try {
            setLoading(true);
            const data = await crmLeadsService.getAll();
            setLeads(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading CRM leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await crmLeadsService.create({
                ...newLead,
                status: 'NEW'
            });
            setIsAddModalOpen(false);
            setNewLead({ name: '', email: '', phone: '', notes: '' });
            loadLeads();
        } catch (error) {
            console.error('Error creating lead:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // If dropped outside a droppable area, or dropped in the same place
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const leadId = draggableId;
        const newStatus = destination.droppableId as CrmLead['status'];

        // Find the lead that was moved
        const movedLead = leads.find(l => l.id === leadId);
        if (!movedLead || movedLead.status === newStatus) return;

        // Optimistic UI update
        const newLeads = Array.from(leads);
        const leadIndex = newLeads.findIndex(l => l.id === leadId);
        newLeads[leadIndex] = { ...newLeads[leadIndex], status: newStatus };
        setLeads(newLeads);

        try {
            // Send update to server
            await crmLeadsService.updateStatus(leadId, newStatus);
        } catch (error) {
            console.error('Error updating lead status:', error);
            // Revert on error
            loadLeads();
        }
    };

    const handleMoveLead = async (lead: CrmLead, direction: 'left' | 'right') => {
        const currentIndex = KANBAN_COLUMNS.findIndex(col => col.id === lead.status);
        let newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex >= 0 && newIndex < KANBAN_COLUMNS.length) {
            const newStatus = KANBAN_COLUMNS[newIndex].id;

            // Optimistic update
            setLeads(leads.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));

            try {
                await crmLeadsService.updateStatus(lead.id, newStatus);
            } catch (error) {
                console.error('Error updating lead status:', error);
                // Revert optimistic update
                loadLeads();
            }
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este lead?')) {
            try {
                await crmLeadsService.delete(id);
                loadLeads();
            } catch (error) {
                console.error('Error deleting lead:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Leads (CRM)</h1>
                    <p className="text-muted-foreground">Gerencie seus potenciais clientes no funil de vendas.</p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Novo Lead
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Lead</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateLead} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome</label>
                                <Input
                                    required
                                    value={newLead.name}
                                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                                    placeholder="Nome do cliente ou empresa"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={newLead.email}
                                    onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                                    placeholder="contato@exemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Telefone</label>
                                <Input
                                    value={newLead.phone}
                                    onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notas Iniciais</label>
                                <Input
                                    value={newLead.notes}
                                    onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
                                    placeholder="Observações adicionais..."
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar Lead'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Kanban Board Container */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] items-start">
                    {KANBAN_COLUMNS.map((col, colIndex) => {
                        const columnLeads = leads.filter(lead => lead.status === col.id);
                        return (
                            <div key={col.id} className="flex-1 min-w-[300px] max-w-[350px] bg-slate-50/50 rounded-lg border flex flex-col h-full">
                                <div className="p-3 border-b bg-slate-100/50 flex justify-between items-center shrink-0 rounded-t-lg">
                                    <h3 className="font-semibold">{col.title}</h3>
                                    <Badge variant="secondary" className={col.color}>{columnLeads.length}</Badge>
                                </div>

                                <Droppable droppableId={col.id}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar min-h-[150px]"
                                        >
                                            {columnLeads.length === 0 ? (
                                                <div className="text-center p-4 text-sm text-slate-400 border border-dashed rounded-md bg-white/50">
                                                    Nenhum lead nesta etapa
                                                </div>
                                            ) : (
                                                columnLeads.map((lead, index) => (
                                                    <Draggable key={lead.id.toString()} draggableId={lead.id.toString()} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                                }}
                                                            >
                                                                <Card className={`shadow-sm hover:shadow-md transition-shadow ${snapshot.isDragging ? 'shadow-lg border-primary/50' : ''}`}>
                                                                    <CardContent className="p-4 space-y-3">
                                                                        <div className="flex justify-between items-start">
                                                                            <h4 className="font-medium text-sm">{lead.name}</h4>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6 text-red-500 hover:bg-red-50 -mt-1 -mr-1"
                                                                                onClick={() => handleDeleteLead(lead.id)}
                                                                            >
                                                                                <Trash className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            {lead.email && (
                                                                                <div className="text-xs text-slate-500 truncate">{lead.email}</div>
                                                                            )}
                                                                            {lead.phone && (
                                                                                <div className="text-xs text-slate-500">{lead.phone}</div>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-7 px-2 text-xs md:hidden"
                                                                                disabled={colIndex === 0}
                                                                                onClick={() => handleMoveLead(lead, 'left')}
                                                                            >
                                                                                <MoveLeft className="h-3 w-3 mr-1" />
                                                                            </Button>
                                                                            <div className="hidden md:block text-[10px] text-slate-400">
                                                                                Arraste para mover
                                                                            </div>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-7 px-2 text-xs md:hidden"
                                                                                disabled={colIndex === KANBAN_COLUMNS.length - 1}
                                                                                onClick={() => handleMoveLead(lead, 'right')}
                                                                            >
                                                                                <MoveRight className="h-3 w-3 ml-1" />
                                                                            </Button>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}
