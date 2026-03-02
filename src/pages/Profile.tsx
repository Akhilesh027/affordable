import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Navigate } from "react-router-dom";
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  Truck,
  CheckCircle,
  Clock,
  X,
  PlusCircle,
  Home,
  Phone,
  CreditCard,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/data/products";

const API_BASE = "https://api.jsgallor.com";

type AddressForm = {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault?: boolean;
};

type SavedAddress = AddressForm & {
  _id: string;
  userId: string;
  createdAt?: string;
};

type OrderItem = {
  productId: string | { _id: string };
  quantity: number;
  productSnapshot?: {
    name?: string;
    image?: string;
    price?: number;
    category?: string;
  };
};

type Order = {
  _id: string;
  createdAt: string;
  status: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  pricing?: {
    total?: number;
    subtotal?: number;
    discount?: number;
    shippingCost?: number;
  };
  payment?: {
    method?: "cod" | "upi" | "card";
    status?: "pending" | "paid" | "failed";
  };
  addressId?: any;
};

const emptyAddress: AddressForm = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  isDefault: false,
};

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "settings">("profile");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addAddrOpen, setAddAddrOpen] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);

  // ✅ editing support
  const [editing, setEditing] = useState<SavedAddress | null>(null);

  const [newAddr, setNewAddr] = useState<AddressForm>(emptyAddress);

  // Modals for Orders
  const [trackOpen, setTrackOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const auth = useMemo(() => {
    const token = localStorage.getItem("affordable_token");
    const userRaw = localStorage.getItem("affordable_user");
    const u = userRaw ? JSON.parse(userRaw) : null;
    const userId = u?._id || u?.id || null;
    return { token, userId };
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "orders" as const, label: "Orders", icon: Package },
    { id: "addresses" as const, label: "Addresses", icon: MapPin },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  const statusConfig = {
    delivered: { icon: CheckCircle, label: "Delivered", className: "bg-green-100 text-green-700" },
    shipped: { icon: Truck, label: "Shipped", className: "bg-blue-100 text-blue-700" },
    confirmed: { icon: Clock, label: "Confirmed", className: "bg-purple-100 text-purple-700" },
    placed: { icon: Clock, label: "Placed", className: "bg-yellow-100 text-yellow-700" },
    cancelled: { icon: Package, label: "Cancelled", className: "bg-red-100 text-red-700" },
  } as const;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const calcOrderTotal = (order: Order) => {
    return (
      order?.pricing?.total ??
      order.items.reduce((sum, it) => {
        const price = Number(it.productSnapshot?.price || 0);
        return sum + price * Number(it.quantity || 0);
      }, 0)
    );
  };

  // ------- API -------
  const fetchOrders = async () => {
    if (!auth.token || !auth.userId) return;
    try {
      setOrdersLoading(true);
      const res = await fetch(`${API_BASE}/api/affordable/orders/${auth.userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch orders");
      setOrders(data?.orders || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!auth.token || !auth.userId) return;
    try {
      setAddrLoading(true);
      const res = await fetch(`${API_BASE}/api/affordable/address/${auth.userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch addresses");
      setAddresses(data?.addresses || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to fetch addresses");
    } finally {
      setAddrLoading(false);
    }
  };

  const validateAddress = (a: AddressForm) => {
    if (!a.fullName.trim()) return false;
    if (!/^\d{10}$/.test(a.phone.trim())) return false;
    if (!a.addressLine1.trim()) return false;
    if (!a.city.trim() || !a.state.trim()) return false;
    if (!/^\d{6}$/.test(a.pincode.trim())) return false;
    if (a.email.trim() && !/^\S+@\S+\.\S+$/.test(a.email.trim())) return false;
    return true;
  };

  const openAddAddress = () => {
    setEditing(null);
    setNewAddr(emptyAddress);
    setAddAddrOpen(true);
  };

  const openEditAddress = (addr: SavedAddress) => {
    setEditing(addr);
    setNewAddr({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      email: addr.email || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      landmark: addr.landmark || "",
      isDefault: Boolean(addr.isDefault),
    });
    setAddAddrOpen(true);
  };

  // ✅ ADD or UPDATE (same modal)
  const saveOrUpdateAddress = async () => {
    if (!auth.token || !auth.userId) {
      toast.error("Please login again");
      return;
    }
    if (!validateAddress(newAddr)) {
      toast.error("Please fill a valid address");
      return;
    }

    try {
      setSavingAddr(true);

      const isEdit = Boolean(editing?._id);
      const url = isEdit
        ? `${API_BASE}/api/affordable/address/${editing!._id}`
        : `${API_BASE}/api/affordable/address`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ userId: auth.userId, ...newAddr }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save address");

      toast.success(isEdit ? "Address updated" : "Address saved");
      setAddAddrOpen(false);
      setEditing(null);
      setNewAddr(emptyAddress);
      await fetchAddresses();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save address");
    } finally {
      setSavingAddr(false);
    }
  };

  // ✅ DELETE address
  const deleteAddress = async (addressId: string) => {
    if (!auth.token || !auth.userId) return toast.error("Please login again");

    const ok = window.confirm("Delete this address?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/affordable/address/${addressId}/${auth.userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete address");

      toast.success("Address deleted");
      await fetchAddresses();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete address");
    }
  };

  // fetch when tab changes
  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "addresses") fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ------- Order modals helpers -------
  const timelineSteps = [
    { key: "placed", label: "Order Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ] as const;

  const stepIndex = (s: Order["status"]) => {
    const map: Record<Order["status"], number> = {
      placed: 0,
      confirmed: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1,
    };
    return map[s];
  };

  const openTrack = (order: Order) => {
    setActiveOrder(order);
    setTrackOpen(true);
  };

  const openDetails = (order: Order) => {
    setActiveOrder(order);
    setDetailsOpen(true);
  };

  const closeModals = () => {
    setTrackOpen(false);
    setDetailsOpen(false);
    setActiveOrder(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-primary to-amber-glow rounded-2xl p-6">
              <div className="text-center mb-6">
                <img
                  src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=111827&color=fff"}
                  alt={user?.name || "User"}
                  className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                />
                <h3 className="font-bold mt-3 text-primary-foreground">{user?.name}</h3>
                <p className="text-sm text-primary-foreground/80">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-foreground shadow-md"
                        : "text-primary-foreground/90 hover:bg-white/20"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-primary-foreground/90 hover:bg-white/20"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-6">
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Profile Information</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <Input defaultValue={user?.name} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue={user?.email} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input placeholder="+91 98765 43210" className="mt-1" />
                    </div>
                  </div>
                  <Button>Save Changes</Button>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">My Orders</h2>
                    <Button variant="outline" onClick={fetchOrders} disabled={ordersLoading}>
                      {ordersLoading ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>

                  {ordersLoading ? (
                    <p className="text-muted-foreground">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <p className="text-muted-foreground">
                      No orders yet.{" "}
                      <Link to="/" className="text-primary hover:underline">
                        Start shopping!
                      </Link>
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const status = statusConfig[order.status] || statusConfig.placed;

                        return (
                          <div key={order._id} className="border border-border rounded-2xl p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-bold">#{order._id}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                              </div>

                              <div className="flex items-center gap-3">
                                <p className="font-bold">{formatPrice(calcOrderTotal(order))}</p>
                                <Badge className={status.className}>
                                  <status.icon className="h-3 w-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </div>
                            </div>

                            {order.items[0] && (
                              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dashed border-border">
                                <img
                                  src={order.items[0].productSnapshot?.image || ""}
                                  alt={order.items[0].productSnapshot?.name || "Product"}
                                  className="w-14 h-14 rounded-xl object-cover border border-border"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium line-clamp-1">
                                    {order.items[0].productSnapshot?.name || "Product"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Items: {order.items.length}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="sm" onClick={() => openTrack(order)}>
                                Track Order
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openDetails(order)}>
                                View Details
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES TAB (✅ edit + delete) */}
              {activeTab === "addresses" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">Saved Addresses</h2>
                    <Button variant="outline" onClick={openAddAddress} className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add New Address
                    </Button>
                  </div>

                  {addrLoading ? (
                    <p className="text-muted-foreground">Loading addresses...</p>
                  ) : addresses.length === 0 ? (
                    <p className="text-muted-foreground">No addresses yet. Add your first address.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {addresses.map((a) => (
                        <div key={a._id} className="border border-border rounded-2xl p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold">{a.fullName}</p>
                              <p className="text-sm text-muted-foreground mt-1">{a.phone}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                title="Edit address"
                                onClick={() => openEditAddress(a)}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                title="Delete address"
                                onClick={() => deleteAddress(a._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm mt-3">
                            {a.addressLine1}
                            {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                          </p>
                          <p className="text-sm">
                            {a.city}, {a.state} - {a.pincode}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            {a.landmark ? (
                              <p className="text-xs text-muted-foreground">Landmark: {a.landmark}</p>
                            ) : (
                              <span />
                            )}

                            {a.isDefault ? <Badge className="bg-primary/10 text-primary">Default</Badge> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Settings</h2>
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <span>Email Notifications</span>
                    <input type="checkbox" defaultChecked className="accent-primary" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================== ADD / EDIT ADDRESS MODAL ===================== */}
        {addAddrOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 relative">
              <button
                onClick={() => {
                  setAddAddrOpen(false);
                  setEditing(null);
                  setNewAddr(emptyAddress);
                }}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Home className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">{editing ? "Edit Address" : "Add New Address"}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name*</label>
                  <Input
                    className="mt-1"
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr((p) => ({ ...p, fullName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Phone*</label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={newAddr.phone}
                      maxLength={10}
                      onChange={(e) =>
                        setNewAddr((p) => ({ ...p, phone: e.target.value.replace(/[^\d]/g, "") }))
                      }
                      placeholder="10 digit phone"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Address Line 1*</label>
                  <Input
                    className="mt-1"
                    value={newAddr.addressLine1}
                    onChange={(e) => setNewAddr((p) => ({ ...p, addressLine1: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Address Line 2</label>
                  <Input
                    className="mt-1"
                    value={newAddr.addressLine2}
                    onChange={(e) => setNewAddr((p) => ({ ...p, addressLine2: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">City*</label>
                  <Input
                    className="mt-1"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">State*</label>
                  <Input
                    className="mt-1"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr((p) => ({ ...p, state: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Pincode*</label>
                  <Input
                    className="mt-1"
                    value={newAddr.pincode}
                    maxLength={6}
                    onChange={(e) =>
                      setNewAddr((p) => ({ ...p, pincode: e.target.value.replace(/[^\d]/g, "") }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Landmark</label>
                  <Input
                    className="mt-1"
                    value={newAddr.landmark}
                    onChange={(e) => setNewAddr((p) => ({ ...p, landmark: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Email (optional)</label>
                  <Input
                    className="mt-1"
                    value={newAddr.email}
                    onChange={(e) => setNewAddr((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={Boolean(newAddr.isDefault)}
                    onChange={(e) => setNewAddr((p) => ({ ...p, isDefault: e.target.checked }))}
                  />
                  <span className="text-sm">Set as default address</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddAddrOpen(false);
                    setEditing(null);
                    setNewAddr(emptyAddress);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="hero" onClick={saveOrUpdateAddress} disabled={savingAddr}>
                  {savingAddr ? "Saving..." : editing ? "Update Address" : "Save Address"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TRACK MODAL ===================== */}
        {trackOpen && activeOrder && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-6 relative">
              <button onClick={closeModals} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Track Order</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Order #{activeOrder._id}</p>

              {activeOrder.status === "cancelled" ? (
                <div className="p-4 rounded-2xl border border-border bg-muted">
                  <p className="font-semibold text-red-600">This order was cancelled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timelineSteps.map((s, idx) => {
                    const current = stepIndex(activeOrder.status);
                    const done = idx <= current;

                    return (
                      <div key={s.key} className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                            done ? "bg-primary text-primary-foreground border-primary" : "border-border"
                          }`}
                        >
                          {done ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </div>

                        <div className="flex-1">
                          <p className={`font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                            {s.label}
                          </p>
                          {idx === current && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Current status: <span className="capitalize">{activeOrder.status}</span>
                            </p>
                          )}
                        </div>

                        {idx < timelineSteps.length - 1 && <div className="w-px bg-border h-10 ml-4" />}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={closeModals}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DETAILS MODAL ===================== */}
        {detailsOpen && activeOrder && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 relative max-h-[85vh] overflow-auto">
              <button onClick={closeModals} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Order Details</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Order #{activeOrder._id}</p>

              <div className="border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Payment</p>
                </div>
                <p className="text-sm">
                  Method: <span className="font-semibold uppercase">{activeOrder.payment?.method || "cod"}</span>{" "}
                  • Status: <span className="font-semibold capitalize">{activeOrder.payment?.status || "pending"}</span>
                </p>
              </div>

              <div className="border border-border rounded-2xl p-4">
                <p className="font-semibold mb-3">Items</p>
                <div className="space-y-3">
                  {activeOrder.items.map((it, idx) => {
                    const snap = it.productSnapshot || {};
                    const name = snap.name || "Product";
                    const image = snap.image || "";
                    const price = Number(snap.price || 0);
                    const qty = Number(it.quantity || 1);

                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={image}
                          alt={name}
                          className="w-12 h-12 rounded-xl object-cover border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {qty} • {formatPrice(price)}
                          </p>
                        </div>
                        <p className="font-bold">{formatPrice(price * qty)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-4 mt-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(activeOrder.pricing?.subtotal || 0)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {(activeOrder.pricing?.shippingCost || 0) === 0
                        ? "FREE"
                        : formatPrice(activeOrder.pricing?.shippingCost || 0)}
                    </span>
                  </div>

                  {(activeOrder.pricing?.discount || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(activeOrder.pricing?.discount || 0)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>{formatPrice(calcOrderTotal(activeOrder))}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={closeModals}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
