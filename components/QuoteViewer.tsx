'use client';

import { useRef } from 'react';
import QuotePaper from './QuotePaper';
import QuotePaperModern from './QuotePaperModern';
import QuotePaperSimple from './QuotePaperSimple';
import { Download, Layout } from 'lucide-react';

interface QuoteViewerProps {
    items: any[];
    totalAmount: number;
    teamName: string;
    teamLogoUrl?: string | null;
    managerName?: string;
    managerEmail?: string;
    recipientName: string;
    recipientContact: string; // Assuming we have this or fallback
    type: 'PURCHASE' | 'RENTAL';
    template?: string;
}

export default function QuoteViewer(props: QuoteViewerProps) {
    const pdfRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        if (!pdfRef.current) return;

        try {
            // @ts-ignore
            const html2pdf = (await import('html2pdf.js')).default;

            const opt = {
                margin: 0,
                filename: `견적서_${props.recipientName || 'Draft'}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().from(pdfRef.current).set(opt as any).save();
        } catch (e) {
            console.error('PDF Generation Error:', e);
            alert('PDF 생성 중 오류가 발생했습니다.');
        }
    };

    const renderQuotePaper = () => {
        const { template, ...paperProps } = props;
        const refProps = { ...paperProps, ref: pdfRef };

        switch (template) {
            case 'modern':
                return <QuotePaperModern {...refProps} />;
            case 'simple':
                return <QuotePaperSimple {...refProps} />;
            default:
                return <QuotePaper {...refProps} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#525659] py-10 flex flex-col items-center gap-6">
            <div className="flex justify-between items-center w-[210mm] px-4 md:px-0">
                <div className="flex flex-col">
                    <span className="text-white text-lg font-bold">견적서 확인</span>
                    <span className="text-white/50 text-xs">SmartQuote Viewer</span>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-100 shadow-lg transition-all"
                >
                    <Download size={14} /> PDF 다운로드
                </button>
            </div>

            <div className="w-full overflow-auto flex justify-center py-4">
                <div className="min-w-fit px-4 md:px-0 shadow-2xl">
                    {renderQuotePaper()}
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 pb-10">
                Powered by SmartQuote
            </div>
        </div>
    );
}
