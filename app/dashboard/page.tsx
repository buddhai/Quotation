
import { getUserTeams, getAllQuotes } from "@/app/actions"; // Assuming getAllQuotes is available or I'll just show teams
import Link from "next/link";
import { Plus, Clock, FileText } from "lucide-react";

export default async function DashboardHome() {
    const teams = await getUserTeams();
    const quotes = await getAllQuotes();
    const recentQuotes = quotes.slice(0, 5);

    // Flatten projects from teams
    const allProjects = teams.flatMap((team: any) =>
        team.projects.map((project: any) => ({
            ...project,
            teamName: team.name
        }))
    );

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex justify-between items-end pb-2 border-b border-slate-200/60">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
                </div>
                <Link
                    href="/dashboard/quote/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                    <Plus size={16} />
                    <span>New Quote</span>
                </Link>
            </div>

            {/* Projects Gallery */}
            <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText size={14} />
                    My Projects
                </h2>
                {allProjects.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
                        <p className="text-sm text-slate-500 mb-3">No projects found.</p>
                        <Link href="/dashboard/quote/new" className="text-blue-600 font-bold hover:underline text-sm">Start New Quote</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allProjects.map((project: any) => (
                            <Link
                                key={project.id}
                                href={`/project/${project.id}`}
                                className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 block"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <FileText size={20} />
                                    </div>
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                        {project.teamName}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors truncate">{project.name}</h3>
                                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                                    <span>
                                        {/* @ts-ignore */}
                                        {project._count?.quotes || 0} Quotes
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock size={14} />
                    Recent Documents
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {recentQuotes.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                            {recentQuotes.map(quote => (
                                <Link
                                    key={quote.id}
                                    href={`/share/${quote.id}`}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors border border-slate-100">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{quote.title}</p>
                                            <p className="text-[11px] text-slate-400">{quote.projectName} • {new Date(quote.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase border ${quote.status === 'SENT' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                            }`}>
                                            {quote.status}
                                        </span>
                                        <span className="font-mono font-bold text-slate-700 text-xs w-20 text-right">
                                            ₩ {quote.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-slate-500">No recent activity.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
