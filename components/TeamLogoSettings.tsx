'use client';

import { useState } from 'react';
import { updateTeamLogo } from '@/app/actions';
import { Upload, ImageIcon } from 'lucide-react';

export default function TeamLogoSettings({ teamId, initialLogoUrl }: { teamId: string, initialLogoUrl?: string | null }) {
    const [logoUrl, setLogoUrl] = useState(initialLogoUrl || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
                const result = reader.result as string;
                setLogoUrl(result);
                setIsSaving(true);
                await updateTeamLogo(teamId, result);
                setIsSaving(false);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-6 relative group/upload">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ImageIcon className="text-purple-500" />
                Team Branding
            </h2>

            <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group-hover/upload:border-purple-200">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Team Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <Upload size={20} className="mb-1" />
                            <span className="text-[10px] font-bold">Upload</span>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 mb-1">Company Logo</h3>
                    <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                        Upload your company logo (PNG, JPG) to display on all quotations. <br />
                        It will appear in the top-left header of the PDF.
                    </p>
                    {isSaving && <p className="text-xs font-bold text-purple-600 animate-pulse">Saving changes...</p>}
                </div>
            </div>
        </div>
    );
}
