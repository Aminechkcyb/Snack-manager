"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    Home,
    History,
    BarChart3,
    UtensilsCrossed,
    Settings,
    LogOut,
    ShieldCheck,
    ChefHat
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/contexts/SettingsContext";

const navigation = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Historique", href: "/historique", icon: History },
    { name: "Statistiques", href: "/statistiques", icon: BarChart3 },
    { name: "Menu", href: "/menu", icon: UtensilsCrossed },
    { name: "Paramètres", href: "/parametres", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
    const { settings, currentTheme } = useAppSettings();

    useEffect(() => {
        setRole(localStorage.getItem("userRole"));
        setName(localStorage.getItem("userName") || "");
    }, []);

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r">
            <div className="flex h-20 shrink-0 items-center px-6 border-b gap-3">
                {settings.logo ? (
                    <img
                        src={settings.logo}
                        alt="Logo"
                        className="object-contain rounded-lg transition-all duration-300"
                        style={{ height: settings.logoSize || 40, width: settings.logoSize || 40 }}
                    />
                ) : null}
                <span className={cn(
                    "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                    currentTheme.gradient
                )}>
                    {settings.restaurantName}
                </span>
            </div>

            {/* Profile Section */}
            {role && (
                <div className="px-4 py-4">
                    <div className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border shadow-sm",
                        role === "admin"
                            ? `${currentTheme.lightBg} ${currentTheme.borderColor}`
                            : "bg-slate-50 border-slate-100"
                    )}>
                        <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shadow-sm text-white",
                            role === "admin"
                                ? currentTheme.solidBg
                                : "bg-slate-600"
                        )}>
                            {role === "admin" ? <ShieldCheck className="h-5 w-5" /> : <ChefHat className="h-5 w-5" />}
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase opacity-50 text-slate-500">Compte</div>
                            <div className={cn(
                                "text-sm font-bold capitalize",
                                role === "admin" ? currentTheme.solidText : "text-slate-700"
                            )}>
                                {name || (role === "admin" ? "Administrateur" : "Serveur")}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex flex-1 flex-col px-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                isActive
                                    ? cn("text-white shadow-md", `bg-gradient-to-r ${currentTheme.gradient}`)
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <button
                    onClick={() => {
                        localStorage.removeItem("userRole");
                        localStorage.removeItem("userName");
                        router.push("/login");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
