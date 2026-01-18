"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Check,
    X,
    Edit2,
    Trash2
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useProducts, Product } from "@/hooks/useProducts";
import { ProductModal } from "@/components/ProductModal";
import { useAppSettings } from "@/contexts/SettingsContext";

const categories = ["Tous", "Burgers", "Tacos", "Naan", "Riz", "Boissons", "Desserts"];

export default function MenuPage() {
    const { products, toggleAvailability, addProduct, updateProduct, removeProduct, isLoaded } = useProducts();
    const { currentTheme } = useAppSettings();
    const [selectedCategory, setSelectedCategory] = useState("Tous");
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    if (!isLoaded) return <div className="p-8">Chargement...</div>;

    const filteredProducts = selectedCategory === "Tous"
        ? products
        : products.filter(p => p.category === selectedCategory);

    const handleAddClick = () => {
        setEditingProduct(undefined);
        setIsProductModalOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        if (window.confirm(`Voulez-vous vraiment supprimer "${product.name}" ?`)) {
            removeProduct(product.id);
        }
    };

    const handleSaveProduct = (product: Product) => {
        if (editingProduct) {
            updateProduct(product);
        } else {
            addProduct(product);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900">Gestion du Menu</h1>
                    <p className="text-slate-500">Gérez vos produits et leur disponibilité ({products.length})</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className={cn(
                        "flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:opacity-90",
                        `bg-gradient-to-r ${currentTheme.gradient} shadow-${currentTheme.ringColor}/20`
                    )}
                >
                    <Plus className="h-5 w-5" />
                    Ajouter produit
                </button>
            </div>

            {/* Tabs / Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                            selectedCategory === cat
                                ? cn("text-white shadow-md", `bg-gradient-to-r ${currentTheme.gradient} shadow-${currentTheme.ringColor}/20`)
                                : "bg-white text-slate-600 border hover:border-slate-300"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className={cn(
                        "bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300",
                        !product.available && "opacity-80 grayscale-[0.5]"
                    )}>
                        {/* Image Cover */}
                        <div className="relative h-56 w-full overflow-hidden bg-slate-100 cursor-pointer">
                            <img
                                src={product.image.startsWith('/') ? product.image : (product.image.startsWith('data:') ? product.image : "/products/burger.png")}
                                onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80"; // Fallback placeholder
                                    e.currentTarget.onerror = null;
                                }}
                                alt={product.name}
                                className={cn(
                                    "w-full h-full group-hover:scale-105 transition-transform duration-700",
                                    product.imageFit === 'contain' ? "object-contain p-4 bg-white" : "object-cover"
                                )}
                            />

                            {/* Floating Category Badge */}
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide text-slate-800">
                                    {product.category}
                                </span>
                            </div>

                            {/* Floating Actions */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={() => handleEditClick(product)}
                                    className={cn(
                                        "p-2.5 bg-white text-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95",
                                        `hover:${currentTheme.solidText}`
                                    )}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(product)}
                                    className="p-2.5 bg-white text-slate-700 hover:text-red-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Overlay for Unavailable */}
                            {!product.available && (
                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="bg-white/10 text-white px-4 py-2 rounded-full border border-white/20 font-bold backdrop-blur-md">
                                        Épuisé
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <h3 className="font-bold text-xl text-slate-900 leading-tight">{product.name}</h3>
                                <span className={cn("text-xl font-extrabold shrink-0", currentTheme.solidText)}>{formatPrice(product.price)}</span>
                            </div>

                            <button
                                onClick={() => toggleAvailability(product.id)}
                                className={cn(
                                    "w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-white shadow-lg",
                                    product.available
                                        ? cn(`bg-gradient-to-r ${currentTheme.gradient} shadow-${currentTheme.ringColor}/25 hover:shadow-${currentTheme.ringColor}/40`, "hover:brightness-110 active:scale-[0.98]")
                                        : "bg-red-500 text-white shadow-red-500/25 hover:bg-red-600 active:scale-[0.98]"
                                )}
                            >
                                {product.available ? (
                                    <>
                                        <span>Disponible</span>
                                        <Check className="h-5 w-5" />
                                    </>
                                ) : (
                                    <>
                                        <span>Indisponible</span>
                                        <X className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isProductModalOpen && (
                <ProductModal
                    onClose={() => setIsProductModalOpen(false)}
                    onSave={handleSaveProduct}
                    initialProduct={editingProduct}
                />
            )}
        </div>
    );
}
