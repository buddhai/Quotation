
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Trash2, Settings, Plus, LayoutTemplate, Briefcase } from 'lucide-react';

function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

const NAV_ITEMS = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    { name: 'Templates', href: '/dashboard/templates', icon: LayoutTemplate },
    { name: 'Trash', href: '/dashboard/trash', icon: Trash2 },
];

interface SidebarProps {
    teams?: any[]; // Using any to avoid complex type import for now, or define basic shape
}

export function Sidebar({ teams = [] }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-200 flex flex-col z-50">
            {/* 1. Logo / Brand */}
            <div className="h-14 flex items-center px-5 border-b border-slate-100">
                <Link href="/" className="text-lg font-black text-blue-600 tracking-tight hover:opacity-80 transition-opacity">
                    ModuQuote
                </Link>
            </div>

            {/* 2. Primary Action */}
            <div className="p-3">
                <Link
                    href="/dashboard/quote/new"
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-lg transition-all shadow-sm shadow-blue-200 text-sm"
                >
                    <Plus size={16} strokeWidth={3} />
                    <span>New Document</span>
                </Link>
            </div>

            {/* 3. Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
                {/* Main Links */}
                <div className="space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={classNames(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-[13px] transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Workspaces (Teams) */}
                {teams.length > 0 && (
                    <div>
                        <h3 className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Workspaces
                        </h3>
                        <div className="space-y-0.5">
                            {teams.map((team: any) => (
                                <div key={team.id} className="group flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-2.5">
                                        <Briefcase size={16} />
                                        <span className="font-medium text-[13px] truncate max-w-[100px]">{team.name}</span>
                                    </div>
                                    <Link
                                        href={`/team/${team.id}/settings`}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all text-slate-500"
                                        title="Team Settings"
                                    >
                                        <Settings size={12} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* 4. Bottom / Settings */}
            <div className="p-3 mt-auto border-t border-slate-100">
                {/* User Profile Mini */}
                <div className="mt-1 flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        ME
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate">Account</p>
                        <Link href="/api/auth/signout" className="text-[10px] text-slate-400 hover:text-red-500">
                            Sign out
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}
