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

const QuotePaperSimple = forwardRef<HTMLDivElement, QuotePaperProps>(({
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
            className="bg-white mx-auto text-black relative font-mono text-sm"
            style={{ width: '210mm', minHeight: '297mm', padding: '10mm' }}
        >
            <div className="border border-black p-1">
                {/* Header */}
                <div className="flex border-b border-black p-4 bg-gray-100">
                    <div className="w-1/2">
                        <h1 className="text-2xl font-bold mb-2">QUOTATION</h1>
                        <p className="text-xs">Date: {new Date().toLocaleDateString()}</p>
                        <p className="text-xs">No: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                    <div className="w-1/2 text-right">
                        <h2 className="text-lg font-bold">{teamName}</h2>
                        <p className="text-xs">{managerName} / {managerEmail}</p>
                    </div>
                </div>

                {/* Recipient */}
                <div className="flex border-b border-black">
                    <div className="w-1/2 p-2 border-r border-black">
                        <p className="font-bold bg-gray-200 px-1 mb-1">TO:</p>
                        <p className="px-1">{recipientName}</p>
                        <p className="px-1">{recipientContact}</p>
                    </div>
                    <div className="w-1/2 p-2">
                        <p className="font-bold bg-gray-200 px-1 mb-1">TYPE:</p>
                        <p className="px-1">{type}</p>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-left collapse">
                    <thead>
                        <tr className="bg-gray-200 border-b border-black text-xs">
                            <th className="border-r border-black p-1 w-12 text-center">NO</th>
                            <th className="border-r border-black p-1">ITEM & DESCRIPTION</th>
                            <th className="border-r border-black p-1 w-24 text-right">UNIT PRICE</th>
                            <th className="border-r border-black p-1 w-16 text-center">QTY</th>
                            {type === 'RENTAL' && <th className="border-r border-black p-1 w-16 text-center">TERM</th>}
                            <th className="p-1 w-24 text-right">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => {
                            const itemTotal = type === 'RENTAL' ? item.price * item.qty * (item.period || 1) : item.price * item.qty;
                            return (
                                <tr key={item.id} className="border-b border-black/20 text-xs">
                                    <td className="border-r border-black p-1 text-center align-top">{index + 1}</td>
                                    <td className="border-r border-black p-1 align-top">
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-[10px] text-gray-600 mt-1">{item.specs?.join(', ')}</div>
                                    </td>
                                    <td className="border-r border-black p-1 text-right align-top">{item.price.toLocaleString()}</td>
                                    <td className="border-r border-black p-1 text-center align-top">{item.qty}</td>
                                    {type === 'RENTAL' && <td className="border-r border-black p-1 text-center align-top">{item.period}</td>}
                                    <td className="p-1 text-right align-top">{itemTotal.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                        {/* Empty Rows Filler */}
                        {Array.from({ length: Math.max(0, 15 - items.length) }).map((_, i) => (
                            <tr key={`empty-${i}`} className="border-b border-black/10 text-xs h-8">
                                <td className="border-r border-black p-1"></td>
                                <td className="border-r border-black p-1"></td>
                                <td className="border-r border-black p-1"></td>
                                <td className="border-r border-black p-1"></td>
                                {type === 'RENTAL' && <td className="border-r border-black p-1"></td>}
                                <td className="p-1"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total */}
                <div className="flex border-t border-black">
                    <div className="w-2/3 p-2 border-r border-black text-xs">
                        <p><strong>Note:</strong></p>
                        <p>1. This quotation is valid for 14 days.</p>
                        <p>2. Payment terms: Negotiable.</p>
                    </div>
                    <div className="w-1/3">
                        <div className="flex justify-between p-2 border-b border-black bg-gray-100 font-bold">
                            <span>TOTAL</span>
                            <span>₩ {totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="h-24 p-2 text-center flex flex-col justify-end">
                            <p className="border-t border-black pt-1">(Authorized Signature)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

QuotePaperSimple.displayName = 'QuotePaperSimple';
export default QuotePaperSimple;
