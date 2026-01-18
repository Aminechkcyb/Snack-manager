import { useState, useRef, useEffect } from "react";
import { X, Upload, Check, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/hooks/useProducts";

interface ProductModalProps {
    onClose: () => void;
    onSave: (product: Product) => void;
    initialProduct?: Product;
}

const CATEGORIES = ["Burgers", "Tacos", "Naan", "Riz", "Boissons", "Desserts"];

import { useAppSettings } from "@/contexts/SettingsContext";

export function ProductModal({ onClose, onSave, initialProduct }: ProductModalProps) {
    const { currentTheme } = useAppSettings();
    const [name, setName] = useState(initialProduct?.name || "");
    const [price, setPrice] = useState(initialProduct?.price.toString() || "");
    const [category, setCategory] = useState(initialProduct?.category || CATEGORIES[0]);
    const [image, setImage] = useState<string | null>(initialProduct?.image || null);
    const [imageFit, setImageFit] = useState<"cover" | "contain">(initialProduct?.imageFit || "cover");
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !image) return;

        setIsLoading(true);

        // Simulate network delay for better UX feel
        setTimeout(() => {
            const product: Product = {
                id: initialProduct?.id || Date.now().toString(),
                name,
                price: parseFloat(price),
                category,
                available: initialProduct?.available ?? true,
                image: image, // Base64 string from FileReader
                imageFit
            };

            onSave(product);
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold text-slate-900">
                        {initialProduct ? "Modifier le produit" : "Ajouter un produit"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden",
                                image
                                    ? cn(`border-${currentTheme.ringColor} bg-${currentTheme.lightBg}`)
                                    : "border-slate-300 hover:bg-slate-50"
                            )}
                            style={!image ? { borderColor: undefined } : undefined}
                        >
                            {image ? (
                                <img
                                    src={image}
                                    alt="Preview"
                                    className={cn("w-full h-full", imageFit === 'contain' ? "object-contain" : "object-cover")}
                                />
                            ) : (
                                <div className={cn("flex flex-col items-center gap-2 text-slate-500", `group-hover:${currentTheme.solidText}`)}>
                                    <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium">Importer une photo</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {image && (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setImageFit("cover")}
                                        className={cn(
                                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                            imageFit === "cover" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                        )}
                                    >
                                        Remplir
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageFit("contain")}
                                        className={cn(
                                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                            imageFit === "contain" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900"
                                        )}
                                    >
                                        Ajuster
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Supprimer
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du produit</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Burger Double Cheese"
                                className={cn(
                                    "w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-medium",
                                    `focus:${currentTheme.ringColor}/20`
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prix (€)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.10"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className={cn(
                                        "w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-medium",
                                        `focus:${currentTheme.ringColor}/20`
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className={cn(
                                        "w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-medium bg-white",
                                        `focus:${currentTheme.ringColor}/20`
                                    )}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!name || !price || !image || isLoading}
                            className={cn(
                                "w-full py-3 text-white rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                `bg-gradient-to-r ${currentTheme.gradient} shadow-${currentTheme.ringColor}/25`
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="h-5 w-5" />
                                    {initialProduct ? "Sauvegarder les modifications" : "Ajouter au menu"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
