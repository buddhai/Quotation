
import { getAllQuotes } from "@/app/actions";
import Link from "next/link";
import { Plus, MoreHorizontal, FileText, Search } from "lucide-react";

export default async function DocumentsPage() {
    const quotes = await getAllQuotes();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
                    <p className="text-slate-500">Manage your quotations and contracts</p>
                </div>
                <Link
                    href="/dashboard/quote/new"
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>New Document</span>
                </Link>
            </div>

            {/* Filters / Search Bar (Mock) */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        placeholder="Search documents..."
                        className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-sm"
                    />
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex gap-1 pr-2">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-bold">All</button>
                    <button className="px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-500 text-xs font-bold">Drafts</button>
                    <button className="px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-500 text-xs font-bold">Sent</button>
                    <button className="px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-500 text-xs font-bold">Completed</button>
                </div>
            </div>

            {/* Document List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {quotes.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No documents yet</h3>
                        <p className="text-slate-500 mb-6">Create your first quotation to get started.</p>
                        <Link
                            href="/dashboard/quote/new"
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Create New
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Project Name</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Last Modified</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {quotes.map((quote) => (
                                <tr key={quote.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2.5">
                                        <Link href={`/project/${quote.projectId}`} className="block">
                                            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {quote.projectName}
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                {quote.title} • {quote.teamName}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`
                                    inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide
                                    ${quote.status === 'DRAFT' ? 'bg-slate-100 text-slate-500' : ''}
                                    ${quote.status === 'SENT' ? 'bg-blue-50 text-blue-600 border border-blue-100' : ''}
                                    ${quote.status === 'ACCEPTED' ? 'bg-green-50 text-green-600 border border-green-100' : ''}
                                `}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-slate-500 font-medium">
                                        {new Date(quote.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-slate-900">
                                        ${quote.amount.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-all">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
