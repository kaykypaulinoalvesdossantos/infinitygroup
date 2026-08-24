'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash, MoveRight, MoveLeft, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth';
import { tasksService, Task } from '@/services/api/tasks';
import { projectsService, Project } from '@/services/api/projects';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const KANBAN_COLUMNS = [
  { id: 'IDEA', title: 'IDEA', color: 'bg-blue-100 text-blue-800' },
  { id: 'DOING', title: 'DOING', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'TESTING', title: 'TESTING', color: 'bg-purple-100 text-purple-800' },
  { id: 'DONE', title: 'DONE', color: 'bg-green-100 text-green-800' }
] as const;

export default function ProjectBoardPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const projectId = params.id;
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', isInternal: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        if (!projectId) {
            router.push('/admin/projetos');
            return;
        }

        loadData();
    }, [router, projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [projectData, tasksData] = await Promise.all([
                projectsService.getById(projectId),
                tasksService.getAll(projectId)
            ]);
            setProject(projectData);
            setTasks(Array.isArray(tasksData) ? tasksData : []);
        } catch (error) {
            console.error('Error loading project data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await tasksService.create({
                ...newTask,
                projectId,
                status: 'IDEA'
            } as any); // Casting since isInternal might not be in the initial type yet
            setIsAddModalOpen(false);
            setNewTask({ title: '', description: '', isInternal: false });
            loadData();
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const taskId = draggableId;
        const newStatus = destination.droppableId as Task['status'];

        const movedTask = tasks.find(t => t.id === taskId);
        if (!movedTask || movedTask.status === newStatus) return;

        // Optimistic UI update
        const newTasks = Array.from(tasks);
        const taskIndex = newTasks.findIndex(t => t.id === taskId);
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: newStatus };
        setTasks(newTasks);

        try {
            // Send update to server using the API spec requirement
            await tasksService.updateStatus(taskId, newStatus);
        } catch (error) {
            console.error('Error updating task status:', error);
            // Revert on error
            loadData();
        }
    };

    const handleMoveTask = async (task: Task, direction: 'left' | 'right') => {
        const currentIndex = KANBAN_COLUMNS.findIndex(col => col.id === task.status);
        let newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex >= 0 && newIndex < KANBAN_COLUMNS.length) {
            const newStatus = KANBAN_COLUMNS[newIndex].id;

            // Optimistic update
            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

            try {
                await tasksService.updateStatus(task.id, newStatus as Task['status']);
            } catch (error) {
                console.error('Error updating task status:', error);
                // Revert optimistic update
                loadData();
            }
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
            try {
                await tasksService.delete(id);
                loadData();
            } catch (error) {
                console.error('Error deleting task:', error);
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
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/projetos')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {project?.name || 'Projeto'} - Kanban
                        </h1>
                        <p className="text-muted-foreground">
                            Quadro de tarefas do projeto
                        </p>
                    </div>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Título</label>
                                <Input
                                    required
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Título da tarefa"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descrição</label>
                                <Input
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Detalhes da tarefa..."
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2 pb-2">
                                <Checkbox
                                    id="isInternal"
                                    checked={newTask.isInternal}
                                    onCheckedChange={(checked) => setNewTask({ ...newTask, isInternal: checked as boolean })}
                                />
                                <label
                                    htmlFor="isInternal"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Tarefa Interna (Oculta do Cliente)
                                </label>
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar Tarefa'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Kanban Board Container */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] items-start">
                    {KANBAN_COLUMNS.map((col, colIndex) => {
                        const columnTasks = tasks.filter(task => task.status === col.id);
                        return (
                            <div key={col.id} className="flex-1 min-w-[300px] max-w-[350px] bg-slate-50/50 rounded-lg border flex flex-col h-full">
                                <div className="p-3 border-b bg-slate-100/50 flex justify-between items-center shrink-0 rounded-t-lg">
                                    <h3 className="font-semibold">{col.title}</h3>
                                    <Badge variant="secondary" className={col.color}>{columnTasks.length}</Badge>
                                </div>

                                <Droppable droppableId={col.id}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar min-h-[150px]"
                                        >
                                            {columnTasks.length === 0 ? (
                                                <div className="text-center p-4 text-sm text-slate-400 border border-dashed rounded-md bg-white/50">
                                                    Nenhuma tarefa nesta etapa
                                                </div>
                                            ) : (
                                                columnTasks.map((task, index) => (
                                                    <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
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
                                                                            <h4 className="font-medium text-sm">{task.title}</h4>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6 text-red-500 hover:bg-red-50 -mt-1 -mr-1"
                                                                                onClick={() => handleDeleteTask(task.id)}
                                                                            >
                                                                                <Trash className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>

                                                                        {(task as any).isInternal && (
                                                                            <div className="mt-1 mb-2">
                                                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                                                                    🔒 Interno
                                                                                </Badge>
                                                                            </div>
                                                                        )}

                                                                        {task.description && (
                                                                            <div className="text-xs text-slate-500 line-clamp-2">{task.description}</div>
                                                                        )}

                                                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-7 px-2 text-xs md:hidden"
                                                                                disabled={colIndex === 0}
                                                                                onClick={() => handleMoveTask(task, 'left')}
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
                                                                                onClick={() => handleMoveTask(task, 'right')}
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
