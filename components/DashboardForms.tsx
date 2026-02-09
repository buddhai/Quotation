'use client';

import { createTeam, createProject } from '@/app/actions';
import { useRef } from 'react';
import { Plus } from 'lucide-react';

export function CreateTeamForm() {
    const ref = useRef<HTMLFormElement>(null);

    return (
        <form
            action={async (formData) => {
                await createTeam(formData);
                ref.current?.reset();
            }}
            ref={ref}
            className="flex gap-2 max-w-xs mx-auto"
        >
            <input
                name="name"
                placeholder="Team Name (e.g. Sales A)"
                className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
            />
            <button className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 font-semibold">
                Create
            </button>
        </form>
    );
}

export function CreateTeamInline() {
    const ref = useRef<HTMLFormElement>(null);

    return (
        <form
            action={async (formData) => {
                await createTeam(formData);
                ref.current?.reset();
            }}
            ref={ref}
            className="flex gap-2"
        >
            <input
                name="name"
                placeholder="New Team Name"
                className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm focus:outline-none text-sm"
                required
            />
            <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                + Add Team
            </button>
        </form>
    );
}

export function CreateProjectCard({ teamId }: { teamId: string }) {
    const ref = useRef<HTMLFormElement>(null);

    // Wrapper to append teamId since we can't easily pass it through hidden input if we want to be clean, 
    // but hidden input is fine.
    // For type safety, we'll use a wrapper.

    return (
        <form
            action={async (formData) => {
                await createProject(formData);
                ref.current?.reset();
            }}
            ref={ref}
            className="p-5 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col justify-center items-center gap-2 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
        >
            <input type="hidden" name="teamId" value={teamId} />
            <input
                name="name"
                placeholder="New Project..."
                className="w-full text-center bg-transparent focus:outline-none text-sm font-medium placeholder:text-slate-400"
                required
            />
            <button className="text-xs font-bold text-blue-500 uppercase tracking-wide px-3 py-1 bg-blue-100 rounded-lg hover:bg-blue-200">
                + Add
            </button>
        </form>
    )
}
