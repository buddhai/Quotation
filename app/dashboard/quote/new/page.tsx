
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectPicker from "@/components/ProjectPicker";

export default async function NewQuotePage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) redirect('/');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            teams: {
                include: {
                    projects: {
                        orderBy: { updatedAt: 'desc' }
                    },
                    _count: {
                        select: { projects: true }
                    }
                }
            }
        }
    });

    if (!user) redirect('/');

    // If user has no teams, create default one (First time user)
    if (user.teams.length === 0) {
        const newTeam = await prisma.team.create({
            data: {
                name: "Personal Team",
                ownerId: user.id,
                projects: {
                    create: { name: "General Documents" }
                }
            },
            include: { projects: true }
        });
        redirect(`/project/${newTeam.projects[0].id}/quote/new`);
    }

    // If user has teams but no projects in any team, create default project
    const hasProjects = user.teams.some(t => t.projects.length > 0);
    if (!hasProjects) {
        const firstTeam = user.teams[0];
        const newProject = await prisma.project.create({
            data: {
                name: "General Documents",
                teamId: firstTeam.id
            }
        });
        redirect(`/project/${newProject.id}/quote/new`);
    }

    // If only one team and one project, redirect directly (Streamlined flow)
    const totalProjects = user.teams.reduce((acc, team) => acc + team.projects.length, 0);
    if (user.teams.length === 1 && totalProjects === 1) {
        redirect(`/project/${user.teams[0].projects[0].id}/quote/new`);
    }

    // Otherwise, show Project Picker
    return (
        <div className="min-h-screen bg-slate-50 border-t border-slate-200">
            <ProjectPicker teams={user.teams} />
        </div>
    );
}
