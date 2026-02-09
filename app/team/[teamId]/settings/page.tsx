import { getTeamWithMembers, inviteMember } from '@/app/actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Mail, Shield } from 'lucide-react';

import TeamLogoSettings from '@/components/TeamLogoSettings';

export default async function TeamSettingsPage(props: { params: Promise<{ teamId: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) redirect('/');

    const team = await getTeamWithMembers(params.teamId);
    if (!team) notFound();

    return (
        <main className="min-h-screen p-6 sm:p-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
                    <p className="text-slate-500">Team Settings & Members</p>
                </div>
            </div>

            <div className="grid gap-6">

                {/* Logo Settings */}
                <TeamLogoSettings teamId={team.id} initialLogoUrl={team.logoUrl} />

                {/* Invite Section */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Mail className="text-blue-500" />
                        Invite Member
                    </h2>
                    <p className="text-slate-500 mb-6 text-sm">
                        Invite a new member by email using the input below. They must have already signed up for SmartQuote.
                    </p>

                    <form
                        action={async (formData) => {
                            'use server';
                            await inviteMember(team.id, formData.get('email') as string);
                        }}
                        className="flex gap-2"
                    >
                        <input
                            name="email"
                            type="email"
                            placeholder="colleague@example.com"
                            className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800">
                            Invite
                        </button>
                    </form>
                </div>

                {/* member List */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Users className="text-slate-500" />
                        Team Members ({team.members.length})
                    </h2>

                    <div className="space-y-4">
                        {team.members.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                                        {member.user.image ? (
                                            <img src={member.user.image} alt={member.user.name || 'User'} />
                                        ) : (
                                            (member.user.name?.[0] || 'U')
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{member.user.name}</p>
                                        <p className="text-xs text-slate-500">{member.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {member.role === 'OWNER' && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                                            <Shield size={12} />
                                            OWNER
                                        </span>
                                    )}
                                    {member.role === 'MEMBER' && (
                                        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
                                            MEMBER
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
