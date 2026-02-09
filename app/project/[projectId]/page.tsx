import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getProject } from "../../actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import ShareButton from "@/components/ShareButton";

export default async function ProjectPage(props: { params: Promise<{ projectId: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) redirect('/');

    const project = await getProject(params.projectId);
    if (!project) notFound();

    return (
        <main className="min-h-screen p-6 sm:p-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 pr-4">
                    <ArrowLeft size={20} />
                    <span className="font-bold text-sm">Dashboard</span>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                    <p className="text-slate-500">Project Workspace</p>
                </div>
                <Link
                    href={`/project/${project.id}/quote/new`}
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>New Quote</span>
                </Link>
            </div>

            {/* Quotes List (Table View) */}
            {project.quotes.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center shadow-sm">
                    <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">견적서가 없습니다</h3>
                    <p className="text-slate-500 mb-6">첫 번째 견적서를 작성해보세요.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                <th className="px-6 py-4">견적서 제목</th>
                                <th className="px-6 py-4">상태</th>
                                <th className="px-6 py-4">작성일</th>
                                <th className="px-6 py-4 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {project.quotes.map(quote => (
                                <tr key={quote.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/project/${project.id}/quote/${quote.id}/edit`} className="block">
                                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {quote.title}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {quote.id.slice(0, 8)}...
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                            ${quote.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}
                                        `}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(quote.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center items-center gap-2">
                                        <Link
                                            href={`/project/${project.id}/quote/${quote.id}/edit`}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            편집
                                        </Link>
                                        <ShareButton quoteId={quote.id} />
                                        <Link href={`/share/${quote.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                                            <FileText size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
