"use client";

import { useState, useMemo } from "react";
import { X, Search, Plus, Minus, ShoppingBag, Truck } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Order, OrderItem, OrderType } from "@/lib/types";
import { useAppSettings } from "@/contexts/SettingsContext";

interface NewOrderModalProps {
    onClose: () => void;
    onSubmit: (order: Order) => void;
}

// Mock products for the selection (in a real app, this should come from a context or prop)
const PRODUCTS = [
    { id: "1", name: "Cheese Burger", category: "Burgers", price: 8.50 },
    { id: "2", name: "Tacos L", category: "Tacos", price: 7.00 },
    { id: "3", name: "Tacos XL", category: "Tacos", price: 9.00 },
    { id: "4", name: "Naan Fromage", category: "Naan", price: 4.50 },
    { id: "5", name: "Riz Poulet Curry", category: "Riz", price: 10.50 },
    { id: "6", name: "Coca-Cola", category: "Boissons", price: 2.50 },
    { id: "7", name: "Frites", category: "Accompagnements", price: 3.50 },
    { id: "8", name: "Tiramisu", category: "Desserts", price: 4.00 },
];

const CATEGORIES = ["Tous", "Burgers", "Tacos", "Naan", "Riz", "Boissons", "Desserts"];

export function NewOrderModal({ onClose, onSubmit }: NewOrderModalProps) {
    const [step, setStep] = useState<1 | 2>(1); // 1: Client Info, 2: Menu Selection
    const [customerName, setCustomerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [orderType, setOrderType] = useState<OrderType>("livraison");
    const [selectedCategory, setSelectedCategory] = useState("Tous");
    const [cart, setCart] = useState<{ product: typeof PRODUCTS[0], quantity: number }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { currentTheme } = useAppSettings();

    const addToCart = (product: typeof PRODUCTS[0]) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handleSubmit = () => {
        if (!customerName || !phoneNumber || cart.length === 0) return;

        const newOrder: Order = {
            id: crypto.randomUUID().slice(0, 4).toUpperCase(), // Simple ID generation
            customerName,
            phoneNumber,
            items: cart.map(i => ({ name: i.product.name, quantity: i.quantity })),
            totalPrice: cartTotal,
            status: "nouveau",
            type: orderType,
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            date: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
        };

        onSubmit(newOrder);
        onClose();
    };

    const filteredProducts = PRODUCTS.filter(p =>
        (selectedCategory === "Tous" || p.category === selectedCategory) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Plus className={cn("h-5 w-5", currentTheme.solidText)} />
                        Nouvelle Commande
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Form & Selection */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 border-r">

                        {/* Type Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-900 uppercase">Type de commande</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setOrderType("livraison")}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all",
                                        orderType === "livraison" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-100 hover:border-blue-200 text-slate-500"
                                    )}
                                >
                                    <Truck className="h-5 w-5" /> Livraison
                                </button>
                                <button
                                    onClick={() => setOrderType("emporter")}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all",
                                        orderType === "emporter" ? "border-orange-500 bg-orange-50 text-orange-600" : "border-slate-100 hover:border-orange-200 text-slate-500"
                                    )}
                                >
                                    <ShoppingBag className="h-5 w-5" /> A Emporter
                                </button>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Téléphone</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    placeholder="06 12 34 56 78"
                                    className={cn(
                                        "w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2",
                                        currentTheme.ringColor ? `focus:ring-${currentTheme.ringColor}/20` : "focus:ring-blue-500/20"
                                    )}
                                    style={currentTheme.hex && currentTheme.hex.startsWith('#') ? {} : { outlineColor: 'var(--primary)' }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nom du client</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    placeholder="Jean Dupont"
                                    className={cn(
                                        "w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2",
                                        currentTheme.ringColor ? `focus:ring-${currentTheme.ringColor}/20` : "focus:ring-blue-500/20"
                                    )}
                                />
                            </div>
                            {orderType === "livraison" && (
                                <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-semibold text-slate-700">Adresse de livraison</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder="123 Rue de la République..."
                                        className={cn(
                                            "w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2",
                                            currentTheme.ringColor ? `focus:ring-${currentTheme.ringColor}/20` : "focus:ring-blue-500/20"
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Menu Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-900">Carte & Menu</h4>
                                <div className="relative w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className={cn(
                                            "w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2",
                                            currentTheme.ringColor ? `focus:ring-${currentTheme.ringColor}/20` : "focus:ring-blue-500/20"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors",
                                            selectedCategory === cat ? cn("text-white", `bg-gradient-to-r ${currentTheme.gradient}`) : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Products List */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="p-3 border rounded-xl hover:bg-slate-50 text-left transition-all flex flex-col justify-between h-24 group hover:border-slate-300"
                                    >
                                        <div className="font-bold text-sm text-slate-700 line-clamp-2 group-hover:text-slate-900">
                                            {product.name}
                                        </div>
                                        <div className={cn("font-bold", currentTheme.solidText)}>
                                            {formatPrice(product.price)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Cart Summary */}
                    <div className="w-1/3 bg-slate-50 p-6 flex flex-col border-l">
                        <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            Résumé
                        </h4>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm text-center">
                                    <ShoppingBag className="h-8 w-8 mb-2 opacity-20" />
                                    Ajoutez des produits<br />depuis la carte
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl border flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-slate-900">{item.product.name}</div>
                                            <div className="text-xs text-slate-500">{formatPrice(item.product.price)} x {item.quantity}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => addToCart(item.product)}
                                                className={cn("w-6 h-6 rounded flex items-center justify-center text-white", `bg-gradient-to-r ${currentTheme.gradient}`)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t pt-4 mt-4 space-y-4">
                            <div className="flex items-center justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className={cn("text-transparent bg-clip-text bg-gradient-to-r", currentTheme.gradient)}>{formatPrice(cartTotal)}</span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!customerName || !phoneNumber || cart.length === 0}
                                className={cn(
                                    "w-full py-4 text-white font-bold text-lg rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all",
                                    `bg-gradient-to-r ${currentTheme.gradient}`,
                                    `shadow-${currentTheme.ringColor}/25`
                                )}
                            >
                                Valider la commande
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
