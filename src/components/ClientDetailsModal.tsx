"use client";

import { User, X, Phone, History, Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Order } from "@/lib/types";
import { useAppSettings } from "@/contexts/SettingsContext";

interface ClientDetailsModalProps {
    phoneNumber: string;
    onClose: () => void;
    getHistory: (phone: string) => Order[];
}

export function ClientDetailsModal({ phoneNumber, onClose, getHistory }: ClientDetailsModalProps) {
    const history = getHistory(phoneNumber);
    const totalSpent = history.reduce((sum, order) => sum + order.totalPrice, 0);
    const { currentTheme, settings } = useAppSettings();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <User className={cn("h-5 w-5", currentTheme.solidText)} />
                        Fiche Client
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-500 uppercase font-bold">Client</div>
                            <div className="text-2xl font-bold text-slate-900">{history[0]?.customerName || "Client inconnu"}</div>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Phone className="h-4 w-4" />
                                {phoneNumber}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {/* Loyalty Badge */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-100 rounded-lg shadow-sm">
                                <div className="flex gap-0.5">
                                    {Array.from({ length: Math.min(5, Math.floor(history.length / (settings.loyaltyTarget || 10))) }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    ))}
                                    {Math.floor(history.length / (settings.loyaltyTarget || 10)) === 0 && (
                                        <Star className="h-4 w-4 text-slate-300" />
                                    )}
                                </div>
                                <span className="text-xs font-bold text-yellow-700">
                                    {Math.floor(history.length / (settings.loyaltyTarget || 10))} Étoile(s)
                                </span>
                            </div>

                            <div className="text-right">
                                <div className="text-sm text-slate-500 uppercase font-bold">Total Dépensé</div>
                                <div className={cn("text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r", currentTheme.gradient)}>{formatPrice(totalSpent)}</div>
                                <div className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full inline-block mt-1">
                                    {history.length} commandes au total
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <History className="h-4 w-4 text-slate-400" />
                            Historique des commandes
                        </h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {history.length === 0 ? (
                                <p className="text-slate-500 italic">Aucune commande trouvée.</p>
                            ) : (
                                history.map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 hover:border-blue-200 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "px-2 py-0.5 text-xs rounded font-bold uppercase",
                                                    order.status === "termine" ? "bg-green-100 text-green-700" :
                                                        order.status === "annule" ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-700"
                                                )}>
                                                    {order.status}
                                                </span>
                                                <span className="text-sm font-bold text-slate-900">{order.date} <span className="text-slate-500 font-normal">à {order.timestamp}</span></span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                            </div>
                                        </div>
                                        <div className="font-bold text-slate-700">
                                            {formatPrice(order.totalPrice)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
