import { useState, useEffect } from "react";

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    available: boolean;
    image: string;
    imageFit?: "cover" | "contain";
}

const INITIAL_PRODUCTS: Product[] = [
    { id: "1", name: "Cheese Burger", category: "Burgers", price: 8.50, available: true, image: "/products/burger.png", imageFit: "cover" },
    { id: "2", name: "Tacos L", category: "Tacos", price: 7.00, available: true, image: "/products/tacos.png", imageFit: "cover" },
    { id: "3", name: "Naan Fromage", category: "Naan", price: 4.50, available: false, image: "/products/naan.png" },
    { id: "4", name: "Riz Poulet Curry", category: "Riz", price: 10.50, available: true, image: "/products/rice.png" },
    { id: "5", name: "Coca-Cola", category: "Boissons", price: 2.50, available: true, image: "/products/coke.png" },
];

export function useProducts() {
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("snackProducts_v3");
        if (saved) {
            try {
                setProducts(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse products", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("snackProducts_v3", JSON.stringify(products));
        }
    }, [products, isLoaded]);

    const toggleAvailability = (id: string) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, available: !p.available } : p
        ));
    };

    const updateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
        ));
    };

    const addProduct = (newProduct: Product) => {
        setProducts(prev => [...prev, newProduct]);
    };

    const removeProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const unavailableProducts = products.filter(p => !p.available);
    const unavailableCount = unavailableProducts.length;

    return {
        products,
        toggleAvailability,
        updateProduct,
        addProduct,
        removeProduct,
        unavailableProducts,
        unavailableCount,
        isLoaded
    };
}
