"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import {
    TrendingUp,
    Users,
    AlertTriangle,
    ArrowUpRight,
    Package,
    Crown
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";

import { useState, useMemo } from "react";
import { useAppSettings } from "@/contexts/SettingsContext"; // Import theme context
import { cn } from "@/lib/utils";

// Mock Data - Adjusted to 500-700€ per day as requested
const weeklyData = [
    { name: "Lun", revenue: 520 },
    { name: "Mar", revenue: 610 },
    { name: "Mer", revenue: 550 },
    { name: "Jeu", revenue: 680 },
    { name: "Ven", revenue: 700 },
    { name: "Sam", revenue: 650 },
    { name: "Dim", revenue: 580 },
];

const monthlyData = [
    { name: "Sem 1", revenue: 3800 },
    { name: "Sem 2", revenue: 4200 },
    { name: "Sem 3", revenue: 3900 },
    { name: "Sem 4", revenue: 4500 },
];

const yearlyData = [ // Année 2025
    { name: "Jan", revenue: 17500 }, // ~564/j
    { name: "Fév", revenue: 16800 }, // ~600/j
    { name: "Mar", revenue: 18900 }, // ~610/j
    { name: "Avr", revenue: 17500 },
    { name: "Mai", revenue: 19200 },
    { name: "Juin", revenue: 20500 }, // ~680/j - Good month
    { name: "Juil", revenue: 21700 }, // ~700/j - Peak season
    { name: "Août", revenue: 20100 },
    { name: "Sep", revenue: 18000 },
    { name: "Oct", revenue: 18600 },
    { name: "Nov", revenue: 16500 },
    { name: "Déc", revenue: 22000 }, // Holiday peak
];

const yearlyDataPrevious = [ // Année 2024
    { name: "Jan", revenue: 15500 },
    { name: "Fév", revenue: 14800 },
    { name: "Mar", revenue: 16500 },
    { name: "Avr", revenue: 15900 },
    { name: "Mai", revenue: 17500 },
    { name: "Juin", revenue: 18100 },
    { name: "Juil", revenue: 19500 },
    { name: "Août", revenue: 17800 },
    { name: "Sep", revenue: 16500 },
    { name: "Oct", revenue: 17200 },
    { name: "Nov", revenue: 15800 },
    { name: "Déc", revenue: 20500 },
];

type TimeRange = "week" | "month" | "year";

export default function StatsPage() {
    const { unavailableProducts, unavailableCount, isLoaded, products } = useProducts(); // Get products list
    const { orders } = useOrders(); // Get all orders
    const { currentTheme, settings } = useAppSettings();

    // Calculate Top Products
    const topProducts = useMemo(() => {
        // Create a map of Product Name -> Category for fast lookup
        const productCategoryMap = new Map<string, string>();
        products.forEach(p => productCategoryMap.set(p.name, p.category));

        const productCounts: Record<string, { count: number; name: string; revenue: number }> = {};

        orders.forEach(order => {
            if (order.status === "annule") return;
            order.items.forEach(item => {
                // Determine category from map, or guess 'Inconnu'
                const category = productCategoryMap.get(item.name) || "";

                // Filter Logic: Exclude 'Boissons' category OR explicit drink keywords if missing from map
                const isDrink = category === "Boissons" ||
                    ["coca", "fanta", "sprite", "eau", "pepsi", "7up", "oasis", "boisson", "jus"].some(k => item.name.toLowerCase().includes(k));

                if (isDrink) return; // Skip drinks

                if (!productCounts[item.name]) {
                    productCounts[item.name] = { count: 0, name: item.name, revenue: 0 };
                }
                productCounts[item.name].count += item.quantity;
            });
        });

        return Object.values(productCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [orders]);
    const [timeRange, setTimeRange] = useState<TimeRange | 'custom'>("week");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const filteredData = useMemo(() => {
        if (timeRange === "custom") {
            if (!startDate || !endDate) return [];
            // Mock Daily Logic: Generate data for the range
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Limit to avoid crash on crazy huge range, e.g., max 365 days
            const daysToGenerate = Math.min(diffDays + 1, 365);

            return Array.from({ length: daysToGenerate }).map((_, i) => {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                return {
                    name: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                    // Random revenue between 500 and 700 as requested
                    revenue: Math.floor(Math.random() * 200) + 500
                };
            });
        }
        switch (timeRange) {
            case "week": return weeklyData;
            case "month": return monthlyData;
            case "year": return yearlyData;
            default: return weeklyData;
        }
    }, [timeRange, startDate, endDate]);

    const weeklyDataPrevious = [
        { name: "Lun", revenue: 480 },
        { name: "Mar", revenue: 550 },
        { name: "Mer", revenue: 510 },
        { name: "Jeu", revenue: 600 },
        { name: "Ven", revenue: 650 },
        { name: "Sam", revenue: 620 },
        { name: "Dim", revenue: 540 },
    ];

    const monthlyDataPrevious = [
        { name: "Sem 1", revenue: 3500 },
        { name: "Sem 2", revenue: 3800 },
        { name: "Sem 3", revenue: 3600 },
        { name: "Sem 4", revenue: 4100 },
    ];

    // Calculate Growth
    const growthStats = useMemo(() => {
        if (timeRange === "custom") return null; // No comparison for custom yet

        let previousData: { revenue: number }[] = [];
        switch (timeRange) {
            case "week": previousData = weeklyDataPrevious; break;
            case "month": previousData = monthlyDataPrevious; break;
            case "year": previousData = yearlyDataPrevious; break;
            default: previousData = weeklyDataPrevious;
        }

        const currentTotal = filteredData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
        const previousTotal = previousData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

        if (previousTotal === 0) return { percent: 0, isPositive: true };

        const change = ((currentTotal - previousTotal) / previousTotal) * 100;
        return {
            percent: Math.abs(Math.round(change)),
            isPositive: change >= 0
        };
    }, [timeRange, filteredData]);

    // Hourly Data Logic
    const hourlyStats = useMemo(() => {
        // Mock data for each day - Reduced to meet user requirement (10-20 orders/hour)
        const hourlyDataByDay = {
            lun: [2, 5, 12, 10, 5, 2, 4, 8, 15, 12, 8, 6, 4, 2, 1, 0, 0],
            mar: [3, 6, 14, 11, 6, 3, 4, 9, 16, 13, 9, 7, 5, 2, 1, 0, 0],
            mer: [3, 8, 16, 12, 7, 4, 6, 11, 18, 14, 10, 8, 6, 3, 1, 0, 0],
            jeu: [3, 6, 13, 11, 6, 3, 5, 9, 16, 12, 8, 6, 4, 2, 1, 0, 0],
            ven: [4, 10, 18, 15, 9, 5, 7, 13, 21, 18, 14, 12, 9, 5, 2, 1, 0],
            sam: [5, 12, 21, 17, 10, 6, 9, 15, 23, 20, 16, 13, 9, 6, 3, 2, 0],
            dim: [4, 9, 17, 14, 8, 5, 7, 12, 19, 16, 13, 10, 7, 4, 2, 1, 0],
        };

        const hours = ["11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h", "00h", "01h", "02h", "03h"];

        // Aggregate data based on timeRange
        const allDays = Object.values(hourlyDataByDay);
        // Base weekly sum (sum of all days per hour)
        const weeklySum = Array(17).fill(0).map((_, hourIdx) => {
            return allDays.reduce((sum, dayData) => sum + dayData[hourIdx], 0);
        });

        // We want to show "Average" orders per hour to keep numbers realistic (10-20 range)
        // regardless of the period selected.
        // If we sum up for a year, the "orders at 12h" would be huge (e.g. 5000), which confuses the user.
        // So we divide by 7 to get the "Daily Average" profile.
        const conversionFactor = 1 / 7;

        const currentData = weeklySum.map(val => Math.round(val * conversionFactor));

        // Chart Data
        const chartData = hours.map((hour, i) => ({
            hour,
            orders: currentData[i]
        }));

        // Summary Statistics
        const maxOrders = Math.max(...currentData);
        const indexMax = currentData.indexOf(maxOrders);
        const peakHour = `${hours[indexMax]}-${indexMax + 1 < hours.length ? hours[indexMax + 1] : ''}`;

        const minOrders = Math.min(...currentData.filter((n: number) => n > 0));
        const indexMin = currentData.indexOf(minOrders);
        const quietHour = `${hours[indexMin]}-${indexMin + 1 < hours.length ? hours[indexMin + 1] : ''}`;

        const total = currentData.reduce((a: number, b: number) => a + b, 0);
        // Average Basket roughly €22.50
        const totalRevenue = total * 22.5;
        const avg = (total / currentData.length).toFixed(1);

        return {
            chartData,
            summary: {
                peakHour,
                maxOrders,
                quietHour,
                revenue: formatPrice(totalRevenue),
                avg
            }
        };
    }, [timeRange]);

    // Use usage of "hex" color for chart if available, otherwise fallback
    // We can use a simple approach: if theme is custom, use the variable string? No, Recharts needs hex strings mostly for some parts.
    // Recharts <stop color> accepts CSS variables like `var(--theme-color)`.
    // So we can use `currentTheme.hex` which maps to `var(...)` for custom.

    if (!isLoaded) return <div className="p-8">Chargement...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-slate-900">Statistiques</h1>
                <p className="text-slate-500">Analysez vos performances et votre stock</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className={cn("p-2 rounded-lg", growthStats?.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        {growthStats ? (
                            <span className={cn("flex items-center text-xs font-bold px-2 py-1 rounded",
                                growthStats.isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                            )}>
                                <ArrowUpRight className={cn("h-3 w-3 mr-1", !growthStats.isPositive && "rotate-90")} />
                                {growthStats.isPositive ? "+" : "-"}{growthStats.percent}%
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                N/A
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="text-slate-500 text-sm font-medium">
                            {timeRange === 'week' ? 'Revenu cette semaine' :
                                timeRange === 'month' ? 'Revenu ce mois' :
                                    timeRange === 'year' ? 'Revenu annuel' : 'Revenu sur la période'}
                        </div>
                        <div className="text-3xl font-bold text-slate-900">
                            {formatPrice(filteredData.reduce((acc, curr) => acc + (curr.revenue || 0), 0))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className={cn("p-2 rounded-lg", currentTheme.lightBg, currentTheme.solidText)}>
                            <Package className="h-6 w-6" />
                        </div>
                        <span className={cn("text-xs font-bold px-2 py-1 rounded", currentTheme.lightBg, currentTheme.solidText)}>
                            Moyenne
                        </span>
                    </div>
                    <div>
                        <div className="text-slate-500 text-sm font-medium">Panier moyen</div>
                        <div className="text-3xl font-bold text-slate-900">
                            {(() => {
                                // Filter strictly for History (Completed orders)
                                const historyOrders = orders.filter(o => o.status === "termine");

                                if (historyOrders.length === 0) return formatPrice(0); // Show 0 if no history yet

                                const totalRev = historyOrders.reduce((sum, o) => sum + o.totalPrice, 0);
                                return formatPrice(totalRev / historyOrders.length);
                            })()}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                            {unavailableCount > 0 ? "Action requise" : "Aucune alerte"}
                        </span>
                    </div>
                    <div>
                        <div className="text-slate-500 text-sm font-medium">Produits indisponibles (Alerte Stock)</div>
                        <div className="text-3xl font-bold text-slate-900">{unavailableCount}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-slate-900">Revenu</h2>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {(['week', 'month', 'year', 'custom'] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                                        timeRange === range
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                    )}
                                >
                                    {range === 'week' ? 'Semaine' : range === 'month' ? 'Mois' : range === 'year' ? 'Année' : 'Période'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Range Inputs */}
                    {timeRange === 'custom' && (
                        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border animate-in slide-in-from-top-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-900">Du</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 bg-white border rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-900">Au</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 bg-white border rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                />
                            </div>
                            <div className="flex-1 text-xs text-slate-400 italic pt-4">
                                Sélectionnez deux dates pour voir l'évolution du revenu sur cette période.
                            </div>
                        </div>
                    )}

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={currentTheme.hex} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={currentTheme.hex} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}€`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff', color: '#0f172a' }}
                                    itemStyle={{ color: '#0f172a' }}
                                    formatter={(value: number | undefined) => [`${formatPrice(value || 0)}`, 'Revenu']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={currentTheme.hex} // Using the variable/hex from theme
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>



                {/* Top Products - Leaderboard Redesign */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden col-span-1 lg:col-span-1 animate-in slide-in-from-right-8 duration-700">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", currentTheme.lightBg, currentTheme.solidText)}>
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900">Top Ventes</h2>
                                <p className="text-xs text-slate-500 font-medium">Classement par volume</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-2">
                        {topProducts.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm">
                                En attente de données...
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {topProducts.map((product, idx) => {
                                    const maxCount = topProducts[0].count;
                                    const percentage = (product.count / maxCount) * 100;

                                    return (
                                        <div key={product.name} className="relative group p-4 rounded-xl hover:bg-slate-50 transition-all duration-300">
                                            {/* Progress Bar Background */}
                                            <div
                                                className={cn("absolute bottom-0 left-0 h-1 transition-all duration-1000 group-hover:h-full group-hover:bg-slate-50/50 -z-10 rounded-xl opacity-10", currentTheme.solidText)}
                                                style={{ width: `${percentage}%` }}
                                            />

                                            <div className="flex items-center gap-4 relative z-10">
                                                {/* Rank Badge */}
                                                <div className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-4 transition-transform duration-300 group-hover:scale-110",
                                                    idx === 0 ? "bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 border-amber-100 shadow-xl shadow-amber-500/40 ring-2 ring-white" :
                                                        idx === 1 ? "bg-slate-100 text-slate-600 border-slate-50" :
                                                            idx === 2 ? "bg-orange-50 text-orange-600 border-orange-50" :
                                                                "bg-white text-slate-400 border-slate-50"
                                                )}>
                                                    {idx === 0 ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white drop-shadow-md">
                                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" className="hidden" />
                                                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" className="hidden" />
                                                            {/* Simple Bold Crown */}
                                                            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                                                        </svg>
                                                    ) : `#${idx + 1}`}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={cn(
                                                            "font-bold truncate pr-4",
                                                            idx === 0 ? "text-slate-900 text-lg" : "text-slate-700"
                                                        )}>
                                                            {product.name}
                                                        </span>
                                                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm text-xs">
                                                            {product.count} <span className="text-slate-400 font-normal">ventes</span>
                                                        </span>
                                                    </div>

                                                    {/* Visual Bar */}
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-1000 ease-out",
                                                                idx === 0 ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 shadow-lg shadow-orange-200" : // Gold Gradient RESTORED
                                                                    idx === 1 ? "bg-slate-400" :
                                                                        idx === 2 ? "bg-orange-300" : "bg-slate-300"
                                                            )}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {/* Footer decoration */}
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 text-center">
                        <button className={cn("text-xs font-bold transition-colors uppercase tracking-wider", currentTheme.solidText, "hover:opacity-80")}>
                            Voir le détail complet
                        </button>
                    </div>
                </div>
            </div>

            {/* Hourly Orders Distribution */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Commandes par heure</h2>
                        <p className="text-sm text-slate-500">Distribution sur {timeRange === 'week' ? 'la semaine' : timeRange === 'month' ? 'le mois' : timeRange === 'year' ? "l'année" : 'la période'}</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {/* Day selector removed as per requirement to link with global timeRange */}
                        <span className="text-xs font-bold text-slate-500 px-3 py-1.5">
                            {timeRange === 'week' ? 'Semaine' : timeRange === 'month' ? 'Mensuel' : timeRange === 'year' ? 'Annuel' : 'Personnalisé'}
                        </span>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyStats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="hour"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff', color: '#0f172a' }}
                                itemStyle={{ color: '#0f172a' }}
                                formatter={(value: number | undefined) => [`${value || 0} commandes`, 'Total']}
                            />
                            <Bar
                                dataKey="orders"
                                fill={currentTheme.hex}
                                radius={[8, 8, 0, 0]}
                                animationDuration={500}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Peak hours summary - Dynamically Calculated */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-slate-50 rounded-lg animate-in fade-in zoom-in duration-300">
                        <div className="text-xs text-slate-500 font-medium mb-1">Heure de pointe</div>
                        <div className={cn("text-xl font-bold", currentTheme.solidText)}>{hourlyStats.summary.peakHour}</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg animate-in fade-in zoom-in duration-300 delay-75">
                        <div className="text-xs text-slate-500 font-medium mb-1">Commandes max</div>
                        <div className={cn("text-xl font-bold", currentTheme.solidText)}>{hourlyStats.summary.maxOrders}</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg animate-in fade-in zoom-in duration-300 delay-100">
                        <div className="text-xs text-slate-500 font-medium mb-1">Revenu {timeRange === 'week' ? 'hebdo' : timeRange === 'month' ? 'mensuel' : timeRange === 'year' ? 'annuel' : 'total'}</div>
                        <div className="text-xl font-bold text-slate-600">{hourlyStats.summary.revenue}</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg animate-in fade-in zoom-in duration-300 delay-150">
                        <div className="text-xs text-slate-500 font-medium mb-1">Commandes/h (en moyenne)</div>
                        <div className="text-xl font-bold text-slate-600">{hourlyStats.summary.avg}</div>
                    </div>
                </div>

            </div>
        </div>
    );
}
