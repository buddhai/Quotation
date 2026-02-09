'use client';

import { useState, useRef, useEffect } from 'react';
import { createQuote, createProduct, getTeamProducts, deleteProduct, updateQuote } from '../app/actions';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Plus, Download, FileText, Upload, ImageIcon, X, Loader2, Play, Layout } from 'lucide-react';
import QuotePaper from './QuotePaper';
import QuotePaperModern from './QuotePaperModern';
import QuotePaperSimple from './QuotePaperSimple';

interface QuoteEditorProps {
    projectId: string;
    teamId: string;
    teamLogoUrl?: string | null;
    teamName: string;
    managerName: string;
    managerEmail: string;
    quoteId?: string; // Optional for Edit Mode
    initialData?: any; // Optional for Edit Mode
}

export default function QuoteEditor({ projectId, teamId, teamLogoUrl, teamName, managerName, managerEmail, quoteId, initialData }: QuoteEditorProps) {
    const router = useRouter();
    const pdfRef = useRef<HTMLDivElement>(null);

    // Initialize with initialData if present, otherwise default
    const [title, setTitle] = useState(initialData?.title || new Date().toISOString().split('T')[0]); // Default to YYYY-MM-DD
    const [recipientEmail, setRecipientEmail] = useState(initialData?.recipientEmail || '');
    const [recipientName, setRecipientName] = useState(initialData?.recipientName || '');
    const [recipientContact, setRecipientContact] = useState('담당자 귀하'); // Not persisted in DB schema currently?
    const [isSending, setIsSending] = useState(false);
    const [type, setType] = useState<'PURCHASE' | 'RENTAL'>(initialData?.type || 'RENTAL');
    const [template, setTemplate] = useState<string>(initialData?.template || 'standard');

    const [items, setItems] = useState<{ id: number, name: string, price: number, qty: number, period: number, specs: string[], image?: string }[]>(
        initialData?.content ? JSON.parse(initialData.content) : [
            { id: 1, name: '베어로보틱스 서비 플러스', price: 600000, qty: 1, period: 36, specs: ["535x550x1095mm", "4단 가변 선반"], image: "https://www.bearrobotics.ai/static/media/servi-plus.18d6015a.png" }
        ]);

    // Product Library State
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [zoom, setZoom] = useState(0.65); // Default zoom level for comfortable viewing

    useEffect(() => {
        if (isLibraryOpen && teamId) {
            loadProducts();
        }
    }, [isLibraryOpen, teamId]);

    const loadProducts = async () => {
        setIsLoadingProducts(true);
        const res = await getTeamProducts(teamId);
        setProducts(res);
        setIsLoadingProducts(false);
    };

    const handleSaveToLibrary = async (item: any) => {
        const formData = new FormData();
        formData.append('name', item.name);
        formData.append('price', item.price.toString());
        formData.append('specs', item.specs.join(', '));
        if (item.image) formData.append('imageUrl', item.image);

        if (!confirm(`'${item.name || '품목'}'을(를) 라이브러리에 저장하시겠습니까?`)) return;

        await createProduct(teamId, formData);
        alert('라이브러리에 저장되었습니다.');
    };

    const handleImportProduct = (product: any) => {
        setItems([...items, {
            id: Date.now(),
            name: product.name,
            price: product.price,
            qty: 1,
            period: type === 'RENTAL' ? 36 : 1,
            specs: product.specs ? product.specs.split(', ') : [],
            image: product.imageUrl || undefined
        }]);
        setIsLibraryOpen(false);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        await deleteProduct(productId);
        loadProducts(); // Refresh
    };

    const total = items.reduce((sum, item) => {
        if (type === 'RENTAL') {
            return sum + (item.price * item.qty * (item.period || 1));
        }
        return sum + (item.price * item.qty);
    }, 0);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: '', price: 0, qty: 1, period: type === 'RENTAL' ? 36 : 1, specs: [] }]);
    };

    const handleUpdateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleImageUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleUpdateItem(id, 'image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownloadPDF = async () => {
        if (!pdfRef.current) return;

        try {
            // @ts-ignore
            const html2pdf = (await import('html2pdf.js')).default;

            const opt = {
                margin: 0,
                filename: `견적서_${recipientName || 'Draft'}.pdf`,
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

    const handleSubmit = async (status: 'DRAFT' | 'SENT') => {
        setIsSending(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', JSON.stringify(items));
        formData.append('amount', total.toString());
        formData.append('status', status);
        formData.append('type', type);
        formData.append('template', template);
        formData.append('recipientName', recipientName);
        if (recipientEmail) formData.append('recipientEmail', recipientEmail);

        if (quoteId) {
            // Update Mode
            await updateQuote(quoteId, projectId, formData);
        } else {
            // Create Mode
            await createQuote(projectId, formData);
        }
        router.push(status === 'SENT' ? '/dashboard/documents' : `/project/${projectId}`);
    };

    const renderQuotePaper = () => {
        const props = {
            ref: pdfRef,
            items: items,
            totalAmount: total,
            teamName: teamName,
            teamLogoUrl: teamLogoUrl,
            managerName: managerName,
            managerEmail: managerEmail,
            recipientName: recipientName,
            recipientContact: recipientContact,
            type: type
        };

        switch (template) {
            case 'modern':
                return <QuotePaperModern {...props} />;
            case 'simple':
                return <QuotePaperSimple {...props} />;
            default:
                return <QuotePaper {...props} />;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5F7F9]"> {/* Lighter background */}
            {/* LEFT: Editor */}
            <div className="w-[480px] flex flex-col border-r border-gray-200 bg-white shadow-xl z-20">
                {/* Navbar */}
                <div className="h-18 border-b border-gray-100 flex items-center px-6 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-800 p-2 -ml-2 rounded-full hover:bg-slate-100 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <span className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                            <FileText size={20} className="text-blue-600" /> {/* Changed to Blue to match brand */}
                            견적 작성
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleSubmit('DRAFT')} className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-colors">임시저장</button>
                        <button onClick={() => handleSubmit('SENT')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">완료</button>
                    </div>
                </div>

                {/* Settings */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Template Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                            <Layout size={12} /> 디자인 템플릿
                        </label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setTemplate('standard')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${template === 'standard' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                표준 (Standard)
                            </button>
                            <button
                                onClick={() => setTemplate('modern')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${template === 'modern' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                모던 (Modern)
                            </button>
                            <button
                                onClick={() => setTemplate('simple')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${template === 'simple' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                심플 (Simple)
                            </button>
                        </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">계약 형태</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setType('RENTAL')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${type === 'RENTAL' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                렌탈 (Rental)
                            </button>
                            <button
                                onClick={() => setType('PURCHASE')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${type === 'PURCHASE' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                구매 (Purchase)
                            </button>
                        </div>
                    </div>

                    {/* Recipient Info */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">수신처 정보</label>
                        <div className="space-y-3">
                            <input
                                value={recipientName}
                                onChange={e => setRecipientName(e.target.value)}
                                className="w-full text-base font-bold text-slate-900 border-2 border-transparent bg-slate-50 hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-xl p-3.5 transition-all placeholder:font-normal placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 outline-none"
                                placeholder="고객사명"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    value={recipientContact}
                                    onChange={e => setRecipientContact(e.target.value)}
                                    className="w-full text-sm font-medium border-2 border-transparent bg-slate-50 hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-xl p-3.5 transition-all outline-none"
                                    placeholder="담당자 (직급)"
                                />
                                <input
                                    value={recipientEmail}
                                    onChange={e => setRecipientEmail(e.target.value)}
                                    className="w-full text-sm font-medium border-2 border-transparent bg-slate-50 hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-xl p-3.5 transition-all outline-none"
                                    placeholder="이메일 (선택)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">품목 리스트</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsLibraryOpen(true)}
                                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Save size={14} /> 라이브러리에서 불러오기
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group relative">
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleSaveToLibrary(item)}
                                            className="text-slate-300 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="라이브러리에 저장"
                                        >
                                            <Save size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-slate-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        {/* Image Upload/Preview */}
                                        <div className="shrink-0">
                                            <label className="block w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group/img">
                                                {item.image ? (
                                                    <>
                                                        <img src={item.image} alt="Product" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 hidden group-hover/img:flex items-center justify-center text-white backdrop-blur-sm">
                                                            <Upload size={16} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center group-hover/img:scale-110 transition-transform">
                                                        <ImageIcon size={20} className="text-slate-300 mb-1 mx-auto" />
                                                        <span className="text-[9px] font-bold text-slate-400">이미지</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(item.id, e)} />
                                            </label>
                                        </div>

                                        <div className="flex-1 space-y-3 pt-1">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    <input
                                                        value={item.name}
                                                        onChange={e => handleUpdateItem(item.id, 'name', e.target.value)}
                                                        className="flex-1 font-bold text-sm text-slate-900 border-none p-0 focus:ring-0 placeholder:text-slate-300"
                                                        placeholder="품목명을 입력하세요"
                                                    />
                                                </div>
                                                <input
                                                    value={(item.specs || []).join(', ')}
                                                    onChange={e => handleUpdateItem(item.id, 'specs', e.target.value.split(', '))}
                                                    className="w-full text-xs font-medium text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                                                    placeholder="상세 스펙 (예: 535x550mm, 4단 선반)"
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">단가</p>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={e => handleUpdateItem(item.id, 'price', Number(e.target.value))}
                                                        className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold text-right focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">수량</p>
                                                    <input
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={e => handleUpdateItem(item.id, 'qty', Number(e.target.value))}
                                                        className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold text-center focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                    />
                                                </div>
                                                {type === 'RENTAL' && (
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">기간(월)</p>
                                                        <input
                                                            type="number"
                                                            value={item.period}
                                                            onChange={e => handleUpdateItem(item.id, 'period', Number(e.target.value))}
                                                            className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold text-center focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddItem}
                            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold text-sm hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
                        >
                            <div className="bg-slate-100 p-1.5 rounded-full group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                                <Plus size={16} />
                            </div>
                            새로운 품목 추가
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: Preview (A4) */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-800/90 wallpaper-pattern">
                {/* Preview Toolbar */}
                <div className="h-14 border-b border-white/10 flex items-center px-6 justify-between bg-black/20 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        <span className="text-white text-xs font-bold opacity-80 uppercase tracking-widest">
                            {template} Preview
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Zoom Controls */}
                        <div className="flex items-center bg-black/30 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
                                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-all"
                            >
                                -
                            </button>
                            <span className="w-12 text-center text-xs font-bold text-white/90 tabular-nums">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
                                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-all"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleDownloadPDF}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                        >
                            <Download size={14} /> PDF 다운로드
                        </button>
                    </div>
                </div>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-auto flex justify-center p-12 relative">
                    <div
                        className="transition-transform duration-200 ease-out origin-top"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <div className="flex flex-col gap-6">
                            <div className="shadow-2xl shadow-black/50 rounded-none overflow-hidden ring-1 ring-white/10">
                                {renderQuotePaper()}
                            </div>

                            <div className="text-center text-xs text-white/30 font-medium">
                                ModuQuote Smart Preview Engine
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Library Modal */}
            {isLibraryOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">제품 라이브러리</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">자주 사용하는 품목을 관리하고 불러오세요.</p>
                            </div>
                            <button onClick={() => setIsLibraryOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-all hover:rotate-90 duration-300">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                            {isLoadingProducts ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Save size={32} className="text-slate-300" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-700 mb-2">저장된 품목이 없습니다</h4>
                                    <p className="text-slate-500 text-sm">견적 작성 중 '저장' 버튼을 눌러 라이브러리에 추가해보세요.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {products.map((product) => (
                                        <div key={product.id} className="flex flex-col bg-white p-4 border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden" onClick={() => handleImportProduct(product)}>
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={24} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 truncate text-base mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {product.specs?.split(', ').map((spec: string, i: number) => (
                                                            <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-dashed border-slate-100 flex justify-between items-center">
                                                <span className="font-mono font-bold text-slate-900 text-lg">
                                                    ₩ {product.price.toLocaleString()}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                                    className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
