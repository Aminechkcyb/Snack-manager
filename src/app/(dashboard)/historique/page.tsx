"use client";

import { useState } from "react";
import {
    ShoppingBag,
    Truck,
    Search,
    Filter,
    User
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { ClientDetailsModal } from "@/components/ClientDetailsModal";

import { useAppSettings } from "@/contexts/SettingsContext";

export default function HistoryPage() {
    const { historyOrders, isLoaded, getClientHistory } = useOrders();
    const { currentTheme } = useAppSettings();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientPhone, setSelectedClientPhone] = useState<string | null>(null);

    const filteredOrders = historyOrders.filter(o =>
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.includes(searchTerm)
    );

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
                    <button className="p-2 bg-white border rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                        <Filter className="h-5 w-5 text-slate-600" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Commande</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Client</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Détails</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Date & Heure</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-500">
                                    Aucune commande trouvée.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center",
                                                order.type === "livraison" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                            )}>
                                                {order.type === "livraison" ? <Truck className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <div className="font-mono text-sm font-medium text-slate-600">#{order.id}</div>
                                                <div className={cn(
                                                    "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit mt-1",
                                                    order.status === "termine" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {order.status}
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
                                        <span className="text-sm text-slate-600 line-clamp-1">
                                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                        </span>
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
        </div>
    );
}
