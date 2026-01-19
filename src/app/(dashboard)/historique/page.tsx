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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

            <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Commande</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Client</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Articles</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Date & Heure</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Montant</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-500">
                                    Aucune commande trouvée.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className={cn(
                                        "hover:bg-slate-50 transition-colors group",
                                        animatingDeleteId === order.id && "animate-trash-exit"
                                    )}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                                order.type === "livraison" ? "bg-blue-50 text-blue-600" :
                                                    order.type === "sur_place" ? "bg-purple-50 text-purple-600" :
                                                        "bg-orange-50 text-orange-600"
                                            )}>
                                                {order.type === "livraison" ? <Truck className="h-4 w-4" /> :
                                                    order.type === "sur_place" ? <Utensils className="h-4 w-4" /> :
                                                        <ShoppingBag className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <div className="font-mono text-sm font-medium text-slate-600">#{order.id}</div>
                                                <div className="flex gap-1 mt-1">
                                                    <div className={cn(
                                                        "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit",
                                                        order.status === "termine" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {order.status}
                                                    </div>
                                                    <div className={cn(
                                                        "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit border",
                                                        order.type === "livraison" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                            order.type === "sur_place" ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                                "bg-orange-50 text-orange-600 border-orange-100"
                                                    )}>
                                                        {order.type === "sur_place" ? "Sur Place" : order.type === "livraison" ? "Livraison" : "Emporter"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-slate-900">{order.customerName}</div>
                                                <div className="text-xs text-slate-500">{order.phoneNumber}</div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedClientPhone(order.phoneNumber)}
                                                className={cn("p-2 bg-slate-100 rounded-lg transition-all text-slate-600", `hover:${currentTheme.lightBg} hover:${currentTheme.solidText}`)}
                                                title="Voir fiche client"
                                            >
                                                <User className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 max-w-[200px]">
                                            {order.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="text-xs text-slate-600 truncate">
                                                    <span className="font-bold text-slate-900">{item.quantity}x</span> {item.name}
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="text-xs text-slate-400 italic">
                                                    +{order.items.length - 3} autres...
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900">{order.date}</span>
                                            <span className="text-xs text-slate-500">{order.timestamp}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={cn("font-bold", currentTheme.solidText)}>{formatPrice(order.totalPrice)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingOrder(order)} // Add click handler
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => printOrder(order, settings)}
                                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="Imprimer le ticket"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(order.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
