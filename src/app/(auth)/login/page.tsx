"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, ShieldCheck, ChefHat, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "admin" | "server";

import { useAppSettings } from "@/contexts/SettingsContext";

export default function LoginPage() {
    const router = useRouter();
    const { currentTheme } = useAppSettings();
    const [role, setRole] = useState<UserRole>("admin");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        // ... previous login logic unchanged
        e.preventDefault();
        setIsLoading(true);
        setError("");

        setTimeout(() => {
            const isValidAdmin = role === "admin" && password === "admin123";
            let isValidServer = false;
            let loggedInName = "Serveur";

            if (role === "server") {
                if (password === "serveur1") {
                    isValidServer = true;
                } else {
                    const savedServers = localStorage.getItem("snackServers");
                    if (savedServers) {
                        const servers = JSON.parse(savedServers) as { name: string; code: string }[];
                        const matchedServer = servers.find(s => s.code === password);
                        if (matchedServer) {
                            isValidServer = true;
                            loggedInName = matchedServer.name;
                        }
                    }
                }
            }

            if (isValidAdmin || isValidServer) {
                localStorage.setItem("userRole", role);
                if (role === "server") {
                    localStorage.setItem("userName", loggedInName);
                } else {
                    localStorage.setItem("userName", "Administrateur");
                }
                router.push("/");
            } else {
                setError("Mot de passe incorrect");
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0">
                <div className={cn("absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20", currentTheme.solidBg)} />
                <div className={cn("absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20", currentTheme.solidBg)} />
            </div>

            <div className={cn("w-full max-w-md bg-white rounded-3xl shadow-xl relative z-10 overflow-hidden border", `shadow-${currentTheme.ringColor}/10`)}>
                {/* Header */}
                <div className={cn("p-8 text-center text-white", `bg-gradient-to-r ${currentTheme.gradient}`)}>
                    <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Connexion</h1>
                    <p className="text-blue-100 mt-2 text-sm">Accédez à votre espace de gestion</p>
                </div>

                <div className="p-8">
                    {/* Role Selector */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-8">
                        <button
                            type="button"
                            onClick={() => setRole("admin")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all",
                                role === "admin"
                                    ? cn("bg-white shadow-sm", currentTheme.solidText)
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("server")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all",
                                role === "server"
                                    ? cn("bg-white shadow-sm", currentTheme.solidText)
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <ChefHat className="h-4 w-4" />
                            Serveur
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {role === 'server' && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">
                                    Prénom
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Votre prénom..."
                                        className={cn(
                                            "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all font-bold placeholder:font-normal",
                                            `focus:${currentTheme.ringColor}/20`
                                        )}
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                {role === 'admin' ? "Mot de passe" : "Code d'accès"}
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    placeholder="Entrez votre code..."
                                    className={cn(
                                        "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-bold placeholder:font-normal",
                                        error
                                            ? "border-red-300 focus:ring-red-200 text-red-600"
                                            : cn("border-slate-200", `focus:${currentTheme.ringColor}/20`)
                                    )}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className={cn("h-5 w-5", error && "text-red-400")} />
                                </div>
                            </div>
                            {error && (
                                <p className="text-xs font-bold text-red-500 ml-1 animate-in slide-in-from-top-1">
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full py-4 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-[0.98]",
                                `bg-gradient-to-r ${currentTheme.gradient} shadow-${currentTheme.ringColor}/25`
                            )}
                        >
                            {isLoading ? (
                                <span>Connexion en cours...</span>
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400">
                            © 2024 SnackManager. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
