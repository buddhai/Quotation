import { notFound } from 'next/navigation';
import { getPublicQuote } from '@/app/actions';
import QuoteViewer from '@/components/QuoteViewer';

export default async function PublicQuotePage(props: { params: Promise<{ quoteId: string }> }) {
    const params = await props.params;
    const quote = await getPublicQuote(params.quoteId);

    if (!quote) notFound();

    const items = JSON.parse(quote.content);
    // In a real app, strict type checking here

    const team = quote.project.team;
    const manager = team.owner; // Provide fallback to team owner as manager

    return (
        <QuoteViewer
            items={items}
            totalAmount={quote.amount}
            teamName={team.name}
            teamLogoUrl={team.logoUrl}
            managerName={manager.name || 'Manager'}
            managerEmail={manager.email}
            recipientName={quote.recipientName || '고객사'}
            recipientContact={''} // We didn't store recipientContact in Quote model yet, using empty string
            type={quote.type as 'PURCHASE' | 'RENTAL'}
            template={quote.template}
        />
    );
}
