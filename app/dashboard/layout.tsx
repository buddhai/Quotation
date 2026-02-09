
import { Sidebar } from "@/components/Sidebar";
import { getUserTeams } from "@/app/actions";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const teams = await getUserTeams();

    return (
        <div className="min-h-screen bg-[#f7f9fa]">
            <Sidebar teams={teams} />
            {/* Main Content Area - offset by sidebar width (w-60 = 15rem = 240px) */}
            <main className="pl-60 min-h-screen">
                <div className="max-w-[1200px] mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
