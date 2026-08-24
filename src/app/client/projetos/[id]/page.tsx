'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth';
import { tasksService, Task } from '@/services/api/tasks';
import { projectsService, Project } from '@/services/api/projects';


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
    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        if (!projectId) {
            router.push('/client/projetos');
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
                    <Button variant="ghost" size="icon" onClick={() => router.push('/client/projetos')}>
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

            </div>

            {/* Kanban Board Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] items-start">
                {KANBAN_COLUMNS.map((col) => {
                    const columnTasks = tasks.filter(task => task.status === col.id);
                    return (
                        <div key={col.id} className="flex-1 min-w-[300px] max-w-[350px] bg-slate-50/50 rounded-lg border flex flex-col h-full">
                            <div className="p-3 border-b bg-slate-100/50 flex justify-between items-center shrink-0 rounded-t-lg">
                                <h3 className="font-semibold">{col.title}</h3>
                                <Badge variant="secondary" className={col.color}>{columnTasks.length}</Badge>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {columnTasks.map((task) => (
                                    <Card key={task.id} className="cursor-default shadow-sm border-slate-200 bg-white">
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-sm text-slate-900">{task.title}</h4>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                                {task.description}
                                            </p>
                                            <div className="flex justify-between items-center text-xs text-slate-400">
                                                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
