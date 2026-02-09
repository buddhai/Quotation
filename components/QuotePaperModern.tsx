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

const QuotePaperModern = forwardRef<HTMLDivElement, QuotePaperProps>(({
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
            className="bg-white mx-auto text-slate-800 flex flex-col font-sans"
            style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}
        >
            <div className="flex-1">
                {/* Header & Brand */}
                <div className="flex justify-between items-start mb-12 pb-6 border-b border-slate-200">
                    <div>
                        <p className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2">Quotation</p>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1">견 적 서</h1>
                        <p className="text-sm font-medium text-slate-400">
                            {type === 'RENTAL' ? 'Robot Rental Service' : 'Robot Purchase Proposal'}
                        </p>
                    </div>
                    {teamLogoUrl ? (
                        <img src={teamLogoUrl} alt={teamName} className="h-12 object-contain" />
                    ) : (
                        <div className="text-xl font-bold text-slate-900">{teamName}</div>
                    )}
                </div>

                {/* Info Grid */}
                <div className="flex justify-between mb-16 gap-12">
                    {/* Client Info */}
                    <div className="flex-1">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Recipient</h3>
                        <div className="space-y-1">
                            <p className="text-xl font-bold text-slate-900">{recipientName || 'Client Name'}</p>
                            <p className="text-sm text-slate-600">{recipientContact}</p>
                        </div>
                    </div>

                    {/* Provider Info */}
                    <div className="flex-1 text-right">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Supplier</h3>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-slate-900">{teamName}</p>
                            <p className="text-sm text-slate-600">{managerName} / {managerEmail}</p>
                            <p className="text-xs text-slate-400 mt-2">
                                Valid Until: <span className="font-medium text-slate-600">{new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Item List */}
                <div className="mb-12">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-900 text-xs font-bold text-slate-900 uppercase tracking-wider">
                                <th className="py-3 w-16">No.</th>
                                <th className="py-3 pl-2">Description</th>
                                <th className="py-3 text-right w-28">Unit Price</th>
                                <th className="py-3 text-center w-16">Qty</th>
                                {type === 'RENTAL' && <th className="py-3 text-center w-16">Mth</th>}
                                <th className="py-3 text-right w-28 text-blue-600">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item, index) => {
                                const itemTotal = type === 'RENTAL' ? item.price * item.qty * (item.period || 1) : item.price * item.qty;
                                return (
                                    <tr key={item.id} className="group">
                                        <td className="py-4 align-top text-xs font-medium text-slate-400 pt-5">
                                            {String(index + 1).padStart(2, '0')}
                                        </td>
                                        <td className="py-4 align-top pl-2 pr-4">
                                            <div className="flex gap-4">
                                                {item.image && (
                                                    <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 p-1">
                                                        <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm mb-1">{item.name}</p>
                                                    <div className="flex flex-wrap gap-1.5 opacity-80">
                                                        {item.specs?.map((spec, i) => (
                                                            <span key={i} className="text-[10px] text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 align-top text-right text-sm font-medium text-slate-700 pt-5">
                                            {item.price.toLocaleString()}
                                        </td>
                                        <td className="py-4 align-top text-center text-sm font-medium text-slate-700 pt-5">
                                            {item.qty}
                                        </td>
                                        {type === 'RENTAL' && (
                                            <td className="py-4 align-top text-center text-sm font-medium text-slate-700 pt-5">
                                                {item.period}
                                            </td>
                                        )}
                                        <td className="py-4 align-top text-right text-sm font-bold text-slate-900 pt-5">
                                            {itemTotal.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Total */}
                <div className="flex justify-end mb-16">
                    <div className="w-[320px]">
                        <div className="flex justify-between items-center mb-3 text-sm">
                            <span className="font-medium text-slate-500">Subtotal</span>
                            <span className="font-bold text-slate-900">₩ {totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 text-sm">
                            <span className="font-medium text-slate-500">Tax</span>
                            <span className="font-medium text-slate-400 text-xs">(Visual Only)</span>
                        </div>
                        <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-end">
                            <span className="font-black text-slate-900 text-lg">Total</span>
                            <div className="text-right">
                                <span className="block text-2xl font-black text-blue-600 leading-none">
                                    ₩ {totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Branding */}
            <div className="mt-auto pt-8 flex justify-between items-center border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">
                    Powered by ModuQuote
                </p>
                <p className="text-[10px] text-slate-300 font-medium">
                    Page 1 / 1
                </p>
            </div>
        </div>
    );
});

QuotePaperModern.displayName = 'QuotePaperModern';
export default QuotePaperModern;
