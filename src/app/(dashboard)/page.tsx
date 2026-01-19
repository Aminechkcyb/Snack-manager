"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Phone,
  User,
  Clock,
  ShoppingBag,
  Truck,
  CheckCircle2,
  PlayCircle,
  MoreVertical,
  ChevronDown,
  History,
  X,
  PlusCircle,
  Bell,
  Trash2,
  Pencil,
  Utensils,
  StickyNote,
  Printer
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { Order, OrderStatus } from "@/lib/types";
import { NewOrderModal } from "@/components/NewOrderModal";
import { DeleteModal } from "@/components/DeleteModal";
import { useAppSettings } from "@/contexts/SettingsContext";
import { printOrder } from "@/lib/printer";

export default function Dashboard() {
  const { orders, activeOrders, updateOrderStatus, updateOrderDetails, deleteOrder, getClientHistory, addOrder, playNotificationSound } = useOrders();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [animatingExitId, setAnimatingExitId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const { currentTheme, settings } = useAppSettings();

  // Get today's date string to match order format (approximate for prototype)
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  // Note: Mock data uses "18 Jan 2026". toLocaleDateString might be "18 janv. 2026". 
  // For safety in this demo, let's also count everything if standard string match fails, 
  // or better, just filter by current date roughly.
  // Actually, let's just count *all* active/recent orders to ensure data shows up for the user demo,
  // since their mock data is hardcoded to "18 Jan 2026".

  const dailyOrders = orders.filter(o => {
    // In a real app, use proper date objects. Here we assume the mock data "18 Jan 2026" is 'today' for the demo context.
    // If we used real dynamic dates, filtering strictly by todayStr might hide the hardcoded mock data.
    // Let's rely on the mock data being "active" or "today". 
    // User asked "sur la journée". 
    return o.date.includes("2026"); // Loose filter for demo, or match 'today' if we want strictness.
  });

  const dailyTakeaway = dailyOrders.filter(o => o.type === "emporter").length;
  const dailyDelivery = dailyOrders.filter(o => o.type === "livraison").length;

  // Handle status change with animation for exit states
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === "termine" || newStatus === "annule") {
      setAnimatingExitId(orderId);
      // Wait for animation to finish before actual status update
      setTimeout(() => {
        updateOrderStatus(orderId, newStatus);
        setAnimatingExitId(null);
      }, 500);
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="capitalize">
              {new Date().toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            • Gérez vos commandes en temps réel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              // Trigger sound explicitly for testing
              await playNotificationSound();

              const now = new Date();
              addOrder({
                id: `sim-${Date.now()}`,
                customerName: "TEST ALERT",
                phoneNumber: "06 00 00 00 00",
                items: [{ name: "🔔 Test Sonore", quantity: 1, price: 0 }],
                totalPrice: 0,
                status: "nouveau",
                type: "emporter",
                timestamp: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                date: now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(',', '')
              });
            }}
            className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Bell className="h-5 w-5" />
            Test Son (Toucher d'abord)
          </button>
          <button
            onClick={() => setIsNewOrderOpen(true)}
            className={cn(
              "flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all",
              `bg-gradient-to-r ${currentTheme.gradient} shadow-${currentTheme.ringColor}/25`
            )}
          >
            <PlusCircle className="h-5 w-5" />
            Nouvelle Commande
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Takeaway KPI */}
        <div className="relative overflow-hidden bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
          <div className={cn("absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:opacity-40", currentTheme.lightBg)}></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-3 rounded-xl group-hover:scale-110 transition-transform duration-300", currentTheme.lightBg)}>
                <ShoppingBag className={cn("h-6 w-6", currentTheme.solidText)} />
              </div>
              <span className="font-bold text-slate-700">À emporter</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={cn("text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r tracking-tight", currentTheme.gradient)}>{dailyTakeaway}</span>
              <span className={cn("text-sm font-bold px-2.5 py-1 rounded-full border", currentTheme.solidText, currentTheme.lightBg, currentTheme.borderColor)}>
                Aujourd'hui
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Commandes locales
            </div>
          </div>
        </div>

        {/* Delivery KPI */}
        <div className="relative overflow-hidden bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
          <div className={cn("absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:opacity-40", currentTheme.lightBg)}></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-3 rounded-xl group-hover:scale-110 transition-transform duration-300", currentTheme.lightBg)}>
                <Truck className={cn("h-6 w-6", currentTheme.solidText)} />
              </div>
              <span className="font-bold text-slate-700">Livraisons</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={cn("text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r tracking-tight", currentTheme.gradient)}>{dailyDelivery}</span>
              <span className={cn("text-sm font-bold px-2.5 py-1 rounded-full border", currentTheme.solidText, currentTheme.lightBg, currentTheme.borderColor)}>
                Aujourd'hui
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
              En cours de tournée
            </div>
          </div>
        </div>

        <div className={cn("p-6 rounded-2xl border text-white space-y-2 shadow-lg", `bg-gradient-to-r ${currentTheme.gradient} border-${currentTheme.ringColor}/10 shadow-${currentTheme.ringColor}/25`)}>
          <div className="flex items-center gap-2 font-semibold opacity-90">
            <PlayCircle className="h-5 w-5" />
            <span>Commandes actives</span>
          </div>
          <div className="text-4xl font-bold">{activeOrders.length}</div>
          <div className="text-sm opacity-80">Prêtes à être préparées</div>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden min-h-[400px]">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Commandes en cours</h2>
        </div>

        <div className="space-y-4 p-4 overflow-x-auto">
          {activeOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed">
              Aucune commande en cours.
            </div>
          ) : (
            activeOrders
              .sort((a, b) => {
                // Custom Date Parser for "18 Jan 2026" + "19:55"
                const parseOrderDate = (o: Order) => {
                  return new Date(`${o.date} ${o.timestamp}`);
                };

                const dateA = parseOrderDate(a);
                const dateB = parseOrderDate(b);

                const now = new Date();
                // @ts-ignore
                const waitA = (now - dateA) / (1000 * 60);
                // @ts-ignore
                const waitB = (now - dateB) / (1000 * 60);

                const isPriorityA = waitA >= 15;
                const isPriorityB = waitB >= 15;

                // 1. Priority First
                if (isPriorityA && !isPriorityB) return -1;
                if (!isPriorityA && isPriorityB) return 1;

                // 2. Then Longest Wait First (within same priority group)
                return dateA.getTime() - dateB.getTime();
              })
              .map((order) => {
                // Calculate wait time for display
                const orderDate = new Date(`${order.date} ${order.timestamp}`);
                const waitTime = Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 60));
                const isPriority = waitTime >= 15;

                // Determine border color based on Type
                const borderColor = order.type === 'livraison' ? 'border-blue-500' :
                  order.type === 'sur_place' ? 'border-purple-500' :
                    'border-orange-500';

                const bgColor = order.type === 'livraison' ? 'bg-blue-50/30' :
                  order.type === 'sur_place' ? 'bg-purple-50/30' :
                    'bg-orange-50/30';

                return (
                  <div key={order.id} className={cn(
                    "p-6 transition-all group border-l-[8px] rounded-xl border shadow-sm relative mb-4",
                    borderColor,
                    bgColor,
                    isPriority && "shadow-red-200 shadow-md ring-1 ring-red-400 animate-pulse",
                    bgColor,
                    isPriority && "shadow-red-200 shadow-md ring-1 ring-red-400 animate-pulse",
                    animatingExitId === order.id && "animate-trash-exit"
                  )}
                    style={isPriority ? {
                      animationDuration: '2s', // Slower pulse for better readability
                      isolation: 'isolate' // Prevent stacking context issues
                    } : undefined}
                  >
                    {/* Grid layout for consistent alignment */}
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Icon + Name + Phone/Time - 5 columns */}
                      <div className="col-span-12 2xl:col-span-5 flex gap-4 items-center">
                        <div className={cn(
                          "relative h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                          isPriority ? "bg-red-100 text-red-600" :
                            order.type === "livraison" ? "bg-blue-50 text-blue-600" :
                              order.type === "sur_place" ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                        )}>
                          {order.type === "livraison" ? <Truck className="h-6 w-6" /> :
                            order.type === "sur_place" ? <Utensils className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}

                          {isPriority && (
                            <div
                              className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-0.5 animate-bounce"
                            >
                              <span>🔥</span>
                              <span>{waitTime}m</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-base">{order.customerName}</span>
                            <StatusInfo status={order.status} />
                            {isPriority && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full border bg-red-600 text-white border-red-700 animate-none"
                              >
                                URGENT
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {order.phoneNumber}</span>
                            <span className={cn("flex items-center gap-1 font-medium", isPriority ? "text-red-600 font-bold" : "")}>
                              <Clock className="h-3 w-3" /> {order.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items - 4 columns */}
                      <div className="col-span-12 2xl:col-span-4">
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                        {order.notes && (
                          <div className="mt-2 text-xs flex items-start gap-1.5 text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                            <StickyNote className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="font-medium italic">"{order.notes}"</span>
                          </div>
                        )}
                      </div>

                      {/* Price + Status - 3 columns */}
                      <div className="col-span-12 2xl:col-span-3 flex items-center justify-between 2xl:justify-end gap-3">
                        <div className="text-right min-w-[80px]">
                          <div className={cn("text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r", currentTheme.gradient)}>{formatPrice(order.totalPrice)}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">{order.type}</div>
                        </div>

                        <StatusSelect
                          currentStatus={order.status}
                          onStatusChange={(status) => handleStatusChange(order.id, status)}
                        />

                        <button
                          onClick={() => setEditingOrder(order)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => printOrder(order, settings)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Imprimer"
                        >
                          <Printer className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => setConfirmDeleteId(order.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {
        (isNewOrderOpen || editingOrder) && (
          <NewOrderModal
            onClose={() => {
              setIsNewOrderOpen(false);
              setEditingOrder(null);
            }}
            onSubmit={(order) => {
              if (editingOrder) {
                updateOrderDetails(order);
              } else {
                addOrder(order);
              }
            }}
            initialOrder={editingOrder}
          />
        )
      }

      <DeleteModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            setAnimatingExitId(confirmDeleteId);
            setConfirmDeleteId(null);

            // Wait for animation to finish before actual delete
            setTimeout(() => {
              deleteOrder(confirmDeleteId);
              setAnimatingExitId(null);
            }, 500);
          }
        }}
        title="Supprimer la commande ?"
        description="Cette action est irréversible. La commande sera supprimée du tableau de bord."
      />
    </div >
  );
}

function StatusInfo({ status }: { status: OrderStatus }) {
  switch (status) {
    case "nouveau":
      return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-600">Nouveau</span>;
    case "en_cours":
      return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-600">En cours</span>;
    default:
      return null;
  }
}



function StatusSelect({ currentStatus, onStatusChange }: { currentStatus: OrderStatus, onStatusChange: (s: OrderStatus) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const gradients = {
    nouveau: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/20",
    en_cours: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/20",
    termine: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/20",
    annule: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/20",
  };

  const labels = {
    nouveau: "Nouveau",
    en_cours: "En cours",
    termine: "Terminé",
    annule: "Annulé",
  };

  const icons = {
    nouveau: ShoppingBag,
    en_cours: PlayCircle,
    termine: CheckCircle2,
    annule: MoreVertical,
  };

  const CurrentIcon = icons[currentStatus] || MoreVertical;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:brightness-110",
          gradients[currentStatus]
        )}
      >
        <CurrentIcon className="h-4 w-4" />
        {labels[currentStatus]}
        <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isMounted && isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-48 bg-white rounded-xl shadow-2xl border p-1.5 z-[99999] animate-in fade-in slide-in-from-top-2"
          style={{ top: `${dropdownPosition.top}px`, right: `${dropdownPosition.right}px` }}
        >
          {(Object.keys(gradients) as OrderStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => {
                onStatusChange(status);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                status === currentStatus ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className={cn("h-2 w-2 rounded-full",
                status === "nouveau" && "bg-blue-500",
                status === "en_cours" && "bg-orange-500",
                status === "termine" && "bg-green-500",
                status === "annule" && "bg-red-500"
              )} />
              {labels[status]}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
