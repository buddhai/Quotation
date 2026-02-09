'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { createProject } from '@/app/actions';

interface ProjectPickerProps {
    teams: any[];
}

export default function ProjectPicker({ teams }: ProjectPickerProps) {
    const router = useRouter();
    const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const activeTeam = teams.find(t => t.id === selectedTeamId);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim() || !selectedTeamId) return;

        const formData = new FormData();
        formData.append('teamId', selectedTeamId);
        formData.append('name', newProjectName);

        try {
            const result = await createProject(formData);
            if (result.success && result.project) {
                router.push(`/project/${result.project.id}/quote/new`);
            } else {
                alert('Failed to create project');
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create project');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <FolderOpen size={32} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Select a Project</h1>
                <p className="text-slate-500 mb-4">Where should this new document belong?</p>
                <button
                    onClick={() => router.back()}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                    <ArrowLeft size={14} /> Back to Dashboard
                </button>
            </div>

            {/* Team Selector */}
            {teams.length > 1 && (
                <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {teams.map(team => (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeamId(team.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${selectedTeamId === team.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {team.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Project List */}
            <div className="grid gap-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {activeTeam?.projects.map((project: any) => (
                    <button
                        key={project.id}
                        onClick={() => router.push(`/project/${project.id}/quote/new`)}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group text-left"
                    >
                        <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-700 block mb-0.5">{project.name}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-2">
                                {new Date(project.updatedAt).toLocaleDateString()}
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                {project._count?.quotes || 0} documents
                            </span>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>

            {/* Create New Project */}
            <div className="border-t border-slate-100 pt-6">
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className={`w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm transition-all flex items-center justify-center gap-2 ${isCreating
                        ? 'border-transparent bg-slate-50 text-slate-400 mb-4'
                        : 'border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                >
                    <Plus size={16} />
                    {isCreating ? 'Cancel Creation' : 'Create New Project'}
                </button>

                {isCreating && (
                    <form onSubmit={handleCreateProject} className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="Enter project name..."
                                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:font-medium placeholder:text-slate-400"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !newProjectName.trim()}
                                className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
