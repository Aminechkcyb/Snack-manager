"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/lib/types";

const LOYAL_CLIENT_ORDERS = Array.from({ length: 25 }).map((_, i) => ({
    id: `loyal-${i}`,
    customerName: "Sophie Martin",
    phoneNumber: "06 00 00 00 00",
    items: [{ name: "Menu complet", quantity: 1, price: 15.00 }],
    totalPrice: 15.00,
    status: "termine" as OrderStatus,
    type: "emporter" as const,
    timestamp: "12:00",
    date: "15 Jan 2026"
}));

const GENERATED_ACTIVE_ORDERS = Array.from({ length: 50 }).map((_, i) => ({
    id: `auto-${i + 1000}`,
    customerName: `Client #${i + 1}`,
    phoneNumber: `06 ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
    items: i % 3 === 0 ? [{ name: "Tacos XL", quantity: 1, price: 9.50 }, { name: "Boisson", quantity: 1, price: 2.50 }] :
        i % 3 === 1 ? [{ name: "Burger Double", quantity: 1, price: 8.50 }, { name: "Frites", quantity: 1, price: 3.50 }] :
            [{ name: "Pizza Reine", quantity: 1, price: 12.00 }],
    totalPrice: 12 + Math.floor(Math.random() * 15),
    status: "nouveau" as OrderStatus,
    type: (Math.random() > 0.6 ? "livraison" : Math.random() > 0.3 ? "emporter" : "sur_place") as "emporter" | "livraison" | "sur_place",
    timestamp: `${19 + Math.floor(i / 20)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    date: "19 Jan 2026" // Today
}));

const SAMPLE_PRODUCTS = [
    { name: "Burger Double Cheese", price: 8.50 },
    { name: "Tacos M", price: 7.00 },
    { name: "Coca Cola", price: 2.50 },
    { name: "Frites", price: 3.50 },
    { name: "Pizza Reine", price: 12.00 },
    { name: "Tiramisu", price: 4.50 },
    { name: "Sandwich Steak", price: 6.50 },
    { name: "Ice Tea Pêche", price: 2.50 }
];

const GENERATED_HISTORY_ORDERS = Array.from({ length: 50 }).map((_, i) => {
    // Generate dates for the last 7 days
    const dayOffset = Math.floor(i / 8);
    const date = new Date(2026, 0, 19 - dayOffset); // Jan 19, 18, 17...
    const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(',', '');

    // Randomize items (1 to 3 items)
    const numItems = Math.floor(Math.random() * 3) + 1;
    const orderItems = Array.from({ length: numItems }).map(() => {
        const product = SAMPLE_PRODUCTS[Math.floor(Math.random() * SAMPLE_PRODUCTS.length)];
        return { name: product.name, quantity: Math.floor(Math.random() * 2) + 1, price: product.price };
    });

    const calculatedTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
        id: `hist-${i + 2000}`,
        customerName: `Client Historique #${i + 1}`,
        phoneNumber: `06 ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
        items: orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        totalPrice: calculatedTotal,
        status: (Math.random() > 0.8 ? "annule" : "termine") as OrderStatus,
        type: (Math.random() > 0.6 ? "livraison" : Math.random() > 0.3 ? "emporter" : "sur_place") as "emporter" | "livraison" | "sur_place",
        timestamp: `${11 + Math.floor(Math.random() * 12)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        date: dateStr
    };
});

const INITIAL_ORDERS: Order[] = [
    ...GENERATED_ACTIVE_ORDERS,
    ...GENERATED_HISTORY_ORDERS,
    ...LOYAL_CLIENT_ORDERS,
    // Active Orders (Dashboard)
    {
        id: "105",
        customerName: "Thomas Martin",
        phoneNumber: "06 11 22 33 44",
        items: [{ name: "Menu Burger Double", quantity: 2, price: 12.00 }, { name: "Nuggets x6", quantity: 1, price: 4.50 }],
        totalPrice: 28.50,
        status: "nouveau",
        type: "livraison",
        timestamp: "19:55",
        date: "18 Jan 2026"
    },
    // ... existing orders (I will keep them by targeting carefully or just replacing the start)
    // Actually I need to be careful not to delete the rest if I use replace.
    // I will replace INITIAL_ORDERS declaration entirely if I can view it all, but better to just PREPEND and use Start/End on the definition.
    // The previous view_file showed lines 6-109.

    // Let's just replace the whole array definition start to include LOYAL_CLIENT_ORDERS
    // And bump the key.

    {
        id: "104",
        customerName: "Sarah Connor",
        phoneNumber: "06 99 88 77 66",
        items: [{ name: "Tacos 3 Viandes", quantity: 1, price: 10.50 }, { name: "Tiramisu", quantity: 1, price: 4.50 }],
        totalPrice: 15.00,
        status: "en_cours",
        type: "emporter",
        timestamp: "19:48",
        date: "18 Jan 2026"
    },
    {
        id: "103",
        customerName: "Lucas Dubreuil",
        phoneNumber: "07 55 44 33 22",
        items: [{ name: "Pizza 4 Fromages", quantity: 1, price: 13.50 }, { name: "Coca-Cola 1.5L", quantity: 1, price: 3.00 }],
        totalPrice: 16.50,
        status: "nouveau",
        type: "emporter",
        timestamp: "19:42",
        date: "18 Jan 2026"
    },

    // History Orders
    {
        id: "102",
        customerName: "Marie Lemoine",
        phoneNumber: "07 88 99 00 11",
        items: [{ name: "Tacos XL", quantity: 1, price: 9.50 }, { name: "Coca-Cola", quantity: 1, price: 2.50 }],
        totalPrice: 12.00,
        status: "termine",
        type: "livraison",
        timestamp: "19:30",
        date: "18 Jan 2026"
    },
    {
        id: "101",
        customerName: "Jean Dupont",
        phoneNumber: "06 12 34 56 78",
        items: [{ name: "Burger Classic", quantity: 2, price: 10.50 }, { name: "Frites", quantity: 1, price: 3.50 }],
        totalPrice: 24.50,
        status: "termine",
        type: "emporter",
        timestamp: "19:15",
        date: "18 Jan 2026"
    },
    {
        id: "99",
        customerName: "Sophie Morel",
        phoneNumber: "06 55 11 22 33",
        items: [{ name: "Salade César", quantity: 1, price: 8.50 }, { name: "Eau Minérale", quantity: 1, price: 2.00 }],
        totalPrice: 10.50,
        status: "termine",
        type: "emporter",
        timestamp: "12:45",
        date: "17 Jan 2026"
    },
    {
        id: "98",
        customerName: "Jean Dupont", // Loyal customer example
        phoneNumber: "06 12 34 56 78",
        items: [{ name: "Pizza Regina", quantity: 1, price: 14.00 }],
        totalPrice: 14.00,
        status: "termine",
        type: "livraison",
        timestamp: "20:30",
        date: "16 Jan 2026"
    },
    {
        id: "97",
        customerName: "Pierre Durand",
        phoneNumber: "07 44 55 66 77",
        items: [{ name: "Burger Enfant", quantity: 1, price: 6.00 }, { name: "Capri-Sun", quantity: 1, price: 2.00 }],
        totalPrice: 8.00,
        status: "annule",
        type: "emporter",
        timestamp: "19:00",
        date: "16 Jan 2026"
    },
    {
        id: "96",
        customerName: "Jean Dupont", // Loyal customer example
        phoneNumber: "06 12 34 56 78",
        items: [{ name: "Tacos L", quantity: 2, price: 10.00 }],
        totalPrice: 20.00,
        status: "termine",
        type: "emporter",
        timestamp: "18:15",
        date: "10 Jan 2026"
    }
];

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("snackOrders_v7");
        if (saved) {
            setOrders(JSON.parse(saved));
        } else {
            setOrders(INITIAL_ORDERS);
            localStorage.setItem("snackOrders_v5", JSON.stringify(INITIAL_ORDERS));
        }
        setIsLoaded(true);
    }, []);

    // Sound Notification Logic (Robust Singleton Pattern + Speech)
    const playNotificationSound = async () => {
        // Strategy 1: Speech Synthesis (Backup for accessibility/mobile)
        try {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance("Ding ! Nouvelle commande !");
                utterance.rate = 1.1;
                utterance.lang = 'fr-FR';
                window.speechSynthesis.speak(utterance);
            }
        } catch (e) {
            console.error("Speech error", e);
        }

        // Strategy 2: AudioContext (Primary Beep)
        try {
            // Use global context if available, otherwise create one
            if (!(window as any).notificationAudioContext) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                    (window as any).notificationAudioContext = new AudioContext();
                }
            }

            const ctx = (window as any).notificationAudioContext;
            if (!ctx) {
                console.error("❌ AudioContext not supported on this device.");
                return;
            }

            // Always try to resume (fixes 'suspended' state on Chrome/Safari)
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            // OSCILLATOR 1 (Main Tone - Ding)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            osc1.type = 'square'; // Aggressive/Loud wave type (Gameboy style) to be sure it's heard
            osc1.frequency.setValueAtTime(660, ctx.currentTime);
            gain1.gain.setValueAtTime(0.2, ctx.currentTime); // Moderate gain for Square wave (it's naturally loud)
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.6);

            // OSCILLATOR 2 (Harmonic - Dong)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc2.type = 'square';
            osc2.frequency.setValueAtTime(520, ctx.currentTime + 0.15);
            gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

            osc2.start(ctx.currentTime + 0.15);
            osc2.stop(ctx.currentTime + 1.2);

            console.log("🔊 Playing Loud Notification (Square Wave)");
        } catch (e) {
            console.error("❌ Audio Error:", e);
        }
    };

    // Better Approach: Trigger sound in addOrder directly. Much simpler and safer.

    const saveOrders = (newOrders: Order[]) => {
        setOrders(newOrders);
        localStorage.setItem("snackOrders_v5", JSON.stringify(newOrders));
    };

    const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
        const newOrders = orders.map(o =>
            o.id === id ? { ...o, status: newStatus } : o
        );
        saveOrders(newOrders);
    };

    const deleteOrder = (id: string) => {
        const newOrders = orders.filter(o => o.id !== id);
        saveOrders(newOrders);
    };

    // Active orders are those NOT finished or cancelled
    // OR we can decide "annule" stays in active for a bit? 
    // Usually "termine" and "annule" go to history.
    const activeOrders = orders.filter(o => o.status !== "termine" && o.status !== "annule");

    // History orders are "termine" or "annule"
    const historyOrders = orders.filter(o => o.status === "termine" || o.status === "annule");

    const getClientHistory = (phoneNumber: string) => {
        return orders.filter(o => o.phoneNumber === phoneNumber).sort((a, b) => {
            // Sort by date/time descending roughly
            return new Date(`${b.date} ${b.timestamp || '00:00'}`).getTime() - new Date(`${a.date} ${a.timestamp || '00:00'}`).getTime();
        });
    };

    const updateOrderDetails = (updatedOrder: Order) => {
        const newOrders = orders.map(o =>
            o.id === updatedOrder.id ? updatedOrder : o
        );
        saveOrders(newOrders);
    };

    const addOrder = (order: Order) => {
        const newOrders = [order, ...orders];
        saveOrders(newOrders);
        playNotificationSound();
    };

    return {
        orders,
        activeOrders,
        historyOrders,
        updateOrderStatus,
        getClientHistory,
        addOrder,
        updateOrderDetails,
        deleteOrder,
        isLoaded,
        playNotificationSound
    };
}
