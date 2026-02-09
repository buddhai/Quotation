import { forwardRef } from 'react';

interface QuoteItem {
    id: number | string;
    name: string;
    price: number;
    qty: number;
    period?: number;
    specs: string[];
    image?: string;
}

interface QuotePaperProps {
    items: QuoteItem[];
    totalAmount: number;
    teamName: string;
    teamLogoUrl?: string | null;
    managerName?: string;
    managerEmail?: string;
    recipientName: string;
    recipientContact: string;
    type: 'PURCHASE' | 'RENTAL';
}

const QuotePaper = forwardRef<HTMLDivElement, QuotePaperProps>(({
    items,
    totalAmount,
    teamName,
    teamLogoUrl,
    managerName,
    managerEmail,
    recipientName,
    recipientContact,
    type
}, ref) => {
    return (
        <div
            ref={ref}
            className="bg-white shadow-2xl mx-auto text-slate-900 relative"
            style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-16">
                {teamLogoUrl ? (
                    <img src={teamLogoUrl} alt={teamName} className="h-16 object-contain max-w-[200px]" />
                ) : (
                    <h1 className="text-3xl font-black tracking-tighter italic">{teamName}<span className="text-red-600">.</span></h1>
                )}

                <div className="text-right">
                    <h2 className="text-2xl font-black tracking-tight border-b-2 border-red-600 pb-1 inline-block">
                        {type === 'RENTAL' ? '견 적 서 (Rental)' : '견 적 서 (Purchase)'}
                    </h2>
                    <p className="text-[10px] font-bold text-gray-300 mt-2 tracking-widest">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Addresses */}
            <div className="flex justify-between mb-20">
                <div className="w-1/2 border-l-4 border-gray-100 pl-6">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">TO. 수신처</p>
                    <p className="text-xl font-bold mb-1">{recipientName || '고객사명'}</p>
                    <p className="text-[13px] font-medium text-gray-400">{recipientContact}</p>
                </div>
                <div className="w-1/2 text-right">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">FROM. 발신처</p>
                    <p className="text-sm font-bold text-gray-800">{teamName}</p>
                    <p className="text-lg font-black mt-1">{managerName} 매니저</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-1">{managerEmail}</p>
                </div>
            </div>

            {/* Table Header */}
            <div className="flex border-b border-gray-900 pb-2 mb-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <div className="w-[30px]">No</div>
                <div className="flex-1 px-4">Description</div>
                <div className="w-16 text-center">Image</div>
                <div className="w-40 text-right">Pricing</div>
            </div>

            {/* Table Body */}
            <div className="flex-grow">
                {items.map((item, index) => {
                    const itemTotal = type === 'RENTAL' ? item.price * item.qty * (item.period || 1) : item.price * item.qty;
                    return (
                        <div key={item.id} className="flex items-start py-5 border-b border-gray-100 page-break-inside-avoid">
                            <div className="w-[30px] font-bold text-[11px] text-gray-300 pt-1">{String(index + 1).padStart(2, '0')}</div>
                            <div className="flex-1 px-4">
                                <p className="text-[13px] font-bold text-gray-800 mb-2">{item.name || '품목명'}</p>
                                <div className="flex flex-wrap gap-1">
                                    {item.specs && item.specs.length > 0 ? (
                                        item.specs.map((spec, i) => (
                                            <span key={i} className="bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-[4px] text-[9px] font-medium">{spec.trim()}</span>
                                        ))
                                    ) : (
                                        <span className="text-[9px] text-gray-300">스펙 정보 없음</span>
                                    )}
                                </div>
                            </div>
                            <div className="w-16 flex items-center justify-center">
                                {item.image && <img src={item.image} className="w-12 h-12 object-contain mix-blend-multiply" alt="Preview" />}
                            </div>
                            <div className="w-40 text-right pl-4 border-l border-gray-50">
                                <div className="mb-2">
                                    <p className="text-[8px] font-bold text-gray-300 uppercase mb-0.5">{type === 'RENTAL' ? 'Monthly' : 'Price'}</p>
                                    <p className="text-[13px] font-bold text-gray-600">₩ {item.price.toLocaleString()}</p>
                                </div>
                                <div className="flex justify-end gap-3 mb-2 opacity-60">
                                    <div><p className="text-[8px] font-bold text-gray-300 uppercase">Qty</p><p className="text-[11px] font-bold">{item.qty}EA</p></div>
                                    {type === 'RENTAL' && <div><p className="text-[8px] font-bold text-gray-300 uppercase">Term</p><p className="text-[11px] font-bold">{item.period}M</p></div>}
                                </div>
                                <div className="pt-2 border-t border-dotted border-gray-200">
                                    <p className="text-[8px] font-bold text-gray-300 uppercase mb-0.5">Subtotal</p>
                                    <p className="text-[10px] font-bold text-gray-400">₩ {itemTotal.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Totals */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-end avoid-break">
                <div className="text-[9px] text-gray-400 leading-relaxed font-medium">
                    * 견적 유효기간: 발행일로부터 14일<br />
                    * 부가세(VAT) 별도 기준
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-3xl font-black tracking-tighter text-gray-900">₩ {totalAmount.toLocaleString()}</p>
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-50 text-[8px] font-bold text-gray-300 uppercase tracking-[0.2em] flex justify-between">
                <span>Official Proposal</span>
                <span>{teamName.toUpperCase()}</span>
            </div>
        </div>
    );
});

QuotePaper.displayName = 'QuotePaper';
export default QuotePaper;
