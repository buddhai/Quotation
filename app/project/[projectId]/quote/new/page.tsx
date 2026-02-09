import { getProject } from '@/app/actions';
import QuoteEditor from '@/components/QuoteEditor';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function NewQuotePage(props: { params: Promise<{ projectId: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) redirect('/');

    const project = await getProject(params.projectId);
    if (!project) notFound();

    return (
        <QuoteEditor
            projectId={project.id}
            teamId={project.team.id}
            teamLogoUrl={project.team.logoUrl}
            teamName={project.team.name}
            managerName={session.user?.name || '매니저'}
            managerEmail={session.user?.email || ''}
        />
    );
}
