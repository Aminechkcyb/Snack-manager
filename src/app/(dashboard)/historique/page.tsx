"use client";

import { useState } from "react";
import {
    Truck,
    Search,
    Filter,
    ShoppingBag,
    User,
    Trash2,
    Pencil,
    Utensils,
    Printer
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { ClientDetailsModal } from "@/components/ClientDetailsModal";
import { DeleteModal } from "@/components/DeleteModal";
import { NewOrderModal } from "@/components/NewOrderModal"; // Import Modal
import { useAppSettings } from "@/contexts/SettingsContext";
import { Order } from "@/lib/types"; // Import Type
import { printOrder } from "@/lib/printer"; // Import Printer

export default function HistoryPage() {
    const { historyOrders, isLoaded, getClientHistory, deleteOrder, updateOrderDetails } = useOrders(); // Add update function
    const { currentTheme, settings } = useAppSettings(); // Destructure settings properly
    const [searchTerm, setSearchTerm] = useState("");
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]); // Default today
    const [startTime, setStartTime] = useState("11:00");
    const [endTime, setEndTime] = useState("23:59");
    const [selectedClientPhone, setSelectedClientPhone] = useState<string | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null); // Add editing state
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [animatingDeleteId, setAnimatingDeleteId] = useState<string | null>(null);

    const filteredOrders = historyOrders
        .filter(o => {
            // Parse order date "DD MMM YYYY" to YYYY-MM-DD for comparison
            // This is a bit manual because of the mock data format
            const orderDateStr = new Date(`${o.date} 12:00`).toISOString().split('T')[0];
            const isDateMatch = orderDateStr === historyDate;

            // Time comparison
            // o.timestamp is "HH:MM"
            const orderTime = o.timestamp;
            const isTimeMatch = orderTime >= startTime && orderTime <= endTime;

            const isSearchMatch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.id.includes(searchTerm);

            return isDateMatch && isTimeMatch && isSearchMatch;
        })
        .sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.timestamp}`).getTime();
            const dateB = new Date(`${b.date} ${b.timestamp}`).getTime();
            return dateB - dateA;
        });

    if (!isLoaded) return <div className="p-8">Chargement...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900">Historique des commandes</h1>
                    <div className="flex items-center gap-4 text-slate-500">
                        <span>{historyOrders.length} commandes</span>
                        <span className="h-4 w-px bg-slate-300"></span>
                        <span className={cn("font-bold px-2 py-0.5 rounded", currentTheme.solidText, currentTheme.lightBg)}>
                            Total: {formatPrice(historyOrders.filter(o => o.status !== "annule").reduce((sum, o) => sum + o.totalPrice, 0))}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une commande..."
                            className={cn("pl-10 pr-4 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 w-64 shadow-sm", `focus:${currentTheme.ringColor}/20`)}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Date Filter */}
                        <div className="relative">
                            <input
                                type="date"
                                value={historyDate}
                                onChange={(e) => setHistoryDate(e.target.value)}
                                className="pl-3 pr-2 py-2 bg-white border-2 border-slate-300 text-slate-900 font-bold rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-blue-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                            />
                        </div>

                        {/* Time Range */}
                        <div className="flex items-center gap-1 bg-white border-2 border-slate-300 rounded-xl px-2 py-2 text-sm shadow-sm">
                            <span className="text-slate-600 font-bold text-xs">De</span>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="focus:outline-none bg-transparent w-20 text-center font-bold text-slate-900"
                            />
                            <span className="text-slate-600 font-bold text-xs">à</span>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="focus:outline-none bg-transparent w-20 text-center font-bold text-slate-900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Headers (Hidden on Mobile) */}
            <div className="hidden 2xl:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold uppercase text-slate-500">
                <div className="col-span-2">Commande</div>
                <div className="col-span-3">Client</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Articles</div>
                <div className="col-span-1 text-center">Montant</div>
                <div className="col-span-1 text-right">Actions</div>
            </div>

            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed">
                        Aucune commande trouvée.
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const borderColor = order.type === 'livraison' ? 'border-l-blue-500' :
                            order.type === 'sur_place' ? 'border-l-purple-500' :
                                'border-l-orange-500';

                        return (
                            <div
                                key={order.id}
                                className={cn(
                                    "bg-white shadow-sm hover:shadow-md transition-all group rounded-xl border border-slate-200 border-l-[6px] p-4 2xl:p-0",
                                    borderColor,
                                    animatingDeleteId === order.id && "animate-trash-exit"
                                )}
                            >
                                <div className="grid grid-cols-1 2xl:grid-cols-12 gap-4 items-center 2xl:h-20">

                                    {/* Mobile Top Row: ID + Status + Type */}
                                    <div className="col-span-1 2xl:col-span-2 2xl:pl-6 flex items-center justify-between 2xl:justify-start gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 2xl:h-8 2xl:w-8 rounded-lg flex items-center justify-center shrink-0",
                                                order.type === "livraison" ? "bg-blue-50 text-blue-600" :
                                                    order.type === "sur_place" ? "bg-purple-50 text-purple-600" :
                                                        "bg-orange-50 text-orange-600"
                                            )}>
                                                {order.type === "livraison" ? <Truck className="h-5 w-5 2xl:h-4 2xl:w-4" /> :
                                                    order.type === "sur_place" ? <Utensils className="h-5 w-5 2xl:h-4 2xl:w-4" /> :
                                                        <ShoppingBag className="h-5 w-5 2xl:h-4 2xl:w-4" />}
                                            </div>
                                            <div>
                                                <div className="font-mono text-sm font-medium text-slate-600">#{order.id}</div>
                                                <div className="flex gap-1 mt-1 2xl:hidden xl:flex">
                                                    <div className={cn(
                                                        "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit",
                                                        order.status === "termine" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {order.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Mobile Price Display (Right aligned) */}
                                        <div className="2xl:hidden font-bold text-lg text-slate-900">
                                            {formatPrice(order.totalPrice)}
                                        </div>
                                    </div>

                                    {/* Client Info */}
                                    <div className="col-span-1 2xl:col-span-3 flex items-center justify-between 2xl:justify-start gap-4 2xl:border-l 2xl:pl-4">
                                        <div>
                                            <div className="font-bold text-slate-900 truncate max-w-[120px]">{order.customerName}</div>
                                            <div className="text-xs text-slate-500">{order.phoneNumber}</div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedClientPhone(order.phoneNumber)}
                                            className={cn("p-2 bg-slate-100 rounded-lg transition-all text-slate-600 hover:text-slate-900", `hover:${currentTheme.lightBg} hover:${currentTheme.solidText}`)}
                                            title="Voir fiche client"
                                        >
                                            <User className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Date & Time (Swapped) */}
                                    <div className="col-span-1 2xl:col-span-2 hidden 2xl:block border-l 2xl:pl-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900">{order.date}</span>
                                            <span className="text-xs text-slate-500">{order.timestamp}</span>
                                        </div>
                                    </div>

                                    {/* Articles List (Swapped) */}
                                    <div className="col-span-1 2xl:col-span-3 hidden 2xl:block">
                                        <div className="flex flex-wrap gap-1">
                                            {order.items.slice(0, 3).map((item, idx) => (
                                                <span key={idx} className="inline-flex items-center text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                                    <span className="font-bold mr-1">{item.quantity}x</span> {item.name}
                                                </span>
                                            ))}
                                            {order.items.length > 3 && (
                                                <span className="text-[10px] text-slate-400 pl-1">+{order.items.length - 3} autres</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Desktop Price - Centered */}
                                    <div className="hidden 2xl:flex 2xl:col-span-1 items-center justify-center">
                                        <div className={cn("font-bold text-sm bg-gradient-to-r bg-clip-text text-transparent", currentTheme.gradient)}>
                                            {formatPrice(order.totalPrice)}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 2xl:col-span-1 flex items-center justify-end 2xl:pr-6">
                                        <div className="flex items-center gap-2 w-full 2xl:w-auto justify-end border-t 2xl:border-t-0 pt-4 2xl:pt-0 mt-2 2xl:mt-0">
                                            <button
                                                onClick={() => setEditingOrder(order)}
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Pencil className="h-5 w-5 2xl:h-4 2xl:w-4" />
                                            </button>
                                            <button
                                                onClick={() => printOrder(order, settings)}
                                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border 2xl:border-0"
                                                title="Imprimer"
                                            >
                                                <Printer className="h-5 w-5 2xl:h-4 2xl:w-4" />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(order.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-5 w-5 2xl:h-4 2xl:w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Items List (Accordion style potentially, but list for now) */}
                                <div className="mt-3 pt-3 border-t border-dashed 2xl:hidden">
                                    <div className="text-xs text-slate-500 mb-1 flex justify-between">
                                        <span>{order.date} à {order.timestamp}</span>
                                        <span className="uppercase font-bold text-[10px]">{order.type.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {order.items.map((item, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-xs text-slate-700 border">
                                                <span className="font-bold">{item.quantity}x</span> {item.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {selectedClientPhone && (
                <ClientDetailsModal
                    phoneNumber={selectedClientPhone}
                    onClose={() => setSelectedClientPhone(null)}
                    getHistory={getClientHistory}
                />
            )}

            {/* Edit Modal */}
            {editingOrder && (
                <NewOrderModal
                    onClose={() => setEditingOrder(null)}
                    onSubmit={(updatedOrder) => {
                        updateOrderDetails(updatedOrder);
                        setEditingOrder(null);
                    }}
                    initialOrder={editingOrder}
                />
            )}

            <DeleteModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={() => {
                    if (confirmDeleteId) {
                        setAnimatingDeleteId(confirmDeleteId);
                        setConfirmDeleteId(null);

                        setTimeout(() => {
                            deleteOrder(confirmDeleteId);
                            setAnimatingDeleteId(null);
                        }, 500);
                    }
                }}
                title="Supprimer définitivement ?"
                description="Cette commande sera effacée de l'historique et ne pourra plus être récupérée."
            />
        </div>
    );
}
