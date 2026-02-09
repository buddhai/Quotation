import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteEditor from "@/components/QuoteEditor";

export default async function EditQuotePage(props: { params: Promise<{ projectId: string, quoteId: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) redirect('/');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            teams: {
                include: { members: true }
            },
            memberships: {
                include: { team: true }
            }
        }
    });

    if (!user) redirect('/');

    // Fetch the quote to edit
    const quote = await prisma.quote.findUnique({
        where: { id: params.quoteId },
        include: { project: true }
    });

    if (!quote) notFound();
    if (quote.projectId !== params.projectId) notFound();

    // Determine authorization (User must be member of the project's team)
    // Find the team this project belongs to
    const project = await prisma.project.findUnique({
        where: { id: params.projectId },
        include: { team: true }
    });

    if (!project) notFound();

    // Check if user is member of this team
    const isOwner = project.team.ownerId === user.id;
    const isMember = user.memberships.some(m => m.teamId === project.teamId);

    if (!isOwner && !isMember) redirect('/dashboard');

    // Get Team details for the Editor
    const currentTeam = isOwner ? user.teams.find(t => t.id === project.teamId) : user.memberships.find(m => m.teamId === project.teamId)?.team;

    if (!currentTeam) redirect('/dashboard');

    return (
        <QuoteEditor
            projectId={params.projectId}
            teamId={currentTeam.id}
            teamLogoUrl={currentTeam.logoUrl}
            teamName={currentTeam.name || ''}
            managerName={user.name || ''}
            managerEmail={user.email || ''}
            quoteId={quote.id}
            initialData={quote}
        />
    );
}
