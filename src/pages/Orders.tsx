import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, X, MapPin, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/data/products";

const API_BASE = "https://api.jsgallor.com";

type OrderItem = {
  productId: string | { _id: string };
  quantity: number;
  variantId?: string | null;
  attributes?: {
    size?: string;
    color?: string;
    fabric?: string;
  };
  productSnapshot?: {
    name?: string;
    image?: string;
    price?: number;
    category?: string;
  };
};

type Address = {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
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
    method?: "cod" | "razorpay" | "card";
    status?: "pending" | "paid" | "failed";
    upiId?: string;
    cardLast4?: string;
  };
  addressId?: Address; // populated address
};

// Helper to get color name from hex
const getColorName = (hex: string) => {
  const colors: Record<string, string> = {
    "#8B7355": "Brown",
    "#1C1C1C": "Black",
    "#F5E6D3": "White",
    "#4A4A4A": "Grey",
    "#4A6741": "Green",
    "#2C3E50": "Blue",
  };
  return colors[hex.toUpperCase()] || hex;
};

const Orders = () => {
  const { isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [trackOpen, setTrackOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const auth = useMemo(() => {
    const token = localStorage.getItem("affordable_token");
    const userRaw = localStorage.getItem("affordable_user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const userId = user?._id || user?.id || null;
    return { token, userId };
  }, []);

  const fetchOrders = async () => {
    if (!auth.token || !auth.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Use the authenticated endpoint /my
      const res = await fetch(`${API_BASE}/api/affordable/orders/${auth.userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch orders");

      // The backend returns { data: orders } where orders is an array
      const ordersData = data?.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const statusConfig = {
    delivered: { icon: CheckCircle, label: "Delivered", className: "bg-green-100 text-green-700" },
    shipped: { icon: Truck, label: "Shipped", className: "bg-blue-100 text-blue-700" },
    confirmed: { icon: Clock, label: "Confirmed", className: "bg-purple-100 text-purple-700" },
    placed: { icon: Clock, label: "Placed", className: "bg-yellow-100 text-yellow-700" },
    cancelled: { icon: X, label: "Cancelled", className: "bg-red-100 text-red-700" },
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

  const calcTotal = (order: Order) => {
    return (
      order?.pricing?.total ??
      order.items.reduce((sum, it) => {
        const price = Number(it.productSnapshot?.price || 0);
        return sum + price * Number(it.quantity || 0);
      }, 0)
    );
  };

  // --------- Timeline helpers ----------
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
        <div className="flex items-center justify-between gap-3 mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Link to="/">
              <Button variant="hero">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.placed;

              return (
                <div
                  key={order._id}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-medium transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold">#{order._id}</span>
                      <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                      {order.payment?.method && (
                        <span className="text-xs text-muted-foreground">
                          Payment:{" "}
                          <span className="font-medium uppercase">{order.payment.method}</span>
                          {order.payment.status ? (
                            <>
                              {" "}
                              • <span className="font-medium capitalize">{order.payment.status}</span>
                            </>
                          ) : null}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="font-bold">{formatPrice(calcTotal(order))}</p>
                      <Badge className={status.className}>
                        <status.icon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Show first 2 items */}
                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item, i) => {
                      const snap = item.productSnapshot || {};
                      const name = snap.name || "Product";
                      const image = snap.image || "";
                      const qty = item.quantity || 1;
                      const attributes = item.attributes || {};

                      return (
                        <div
                          key={`${order._id}-${i}`}
                          className="flex items-center gap-4 py-3 border-t border-dashed border-border"
                        >
                          <img
                            src={image}
                            alt={name}
                            className="w-14 h-14 rounded-xl object-cover border border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium line-clamp-1">{name}</p>
                            {/* Variant attributes */}
                            {(attributes.color || attributes.size || attributes.fabric) && (
                              <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                {attributes.color && (
                                  <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                                    <span
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: attributes.color }}
                                    />
                                    {getColorName(attributes.color)}
                                  </span>
                                )}
                                {attributes.size && (
                                  <span className="bg-muted px-2 py-0.5 rounded-full">
                                    Size: {attributes.size}
                                  </span>
                                )}
                                {attributes.fabric && (
                                  <span className="bg-muted px-2 py-0.5 rounded-full capitalize">
                                    {attributes.fabric}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground">Qty: {qty}</p>
                          </div>
                        </div>
                      );
                    })}

                    {order.items.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        +{order.items.length - 2} more item(s)
                      </p>
                    )}
                  </div>

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

        {/* ===================== TRACK MODAL ===================== */}
        {trackOpen && activeOrder && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-6 relative">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted"
                aria-label="Close"
              >
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

                        {idx < timelineSteps.length - 1 && (
                          <div className="w-px bg-border h-10 ml-4" />
                        )}
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
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Order Details</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Order #{activeOrder._id}</p>

              {/* Address */}
              <div className="border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Delivery Address</p>
                </div>

                {activeOrder.addressId ? (
                  <div className="text-sm">
                    <p className="font-semibold">{activeOrder.addressId.fullName}</p>
                    {activeOrder.addressId.phone && (
                      <p className="text-muted-foreground">{activeOrder.addressId.phone}</p>
                    )}
                    <p className="mt-2">
                      {activeOrder.addressId.addressLine1}
                      {activeOrder.addressId.addressLine2 ? `, ${activeOrder.addressId.addressLine2}` : ""}
                    </p>
                    <p>
                      {activeOrder.addressId.city}, {activeOrder.addressId.state} - {activeOrder.addressId.pincode}
                    </p>
                    {activeOrder.addressId.landmark && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Landmark: {activeOrder.addressId.landmark}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Address not available</p>
                )}
              </div>

              {/* Payment */}
              <div className="border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Payment</p>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    Method:{" "}
                    <span className="font-semibold uppercase">{activeOrder.payment?.method || "cod"}</span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className="font-semibold capitalize">{activeOrder.payment?.status || "pending"}</span>
                  </p>
                  {activeOrder.payment?.method === "razorpay" && activeOrder.payment?.status === "paid" && (
                    <p className="text-green-600">Paid via Razorpay</p>
                  )}
                  {activeOrder.payment?.method === "card" && activeOrder.payment?.cardLast4 && (
                    <p className="text-muted-foreground">Card: **** {activeOrder.payment.cardLast4}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="border border-border rounded-2xl p-4">
                <p className="font-semibold mb-3">Items</p>
                <div className="space-y-3">
                  {activeOrder.items.map((it, idx) => {
                    const snap = it.productSnapshot || {};
                    const name = snap.name || "Product";
                    const image = snap.image || "";
                    const price = Number(snap.price || 0);
                    const qty = Number(it.quantity || 1);
                    const attributes = it.attributes || {};

                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={image}
                          alt={name}
                          className="w-12 h-12 rounded-xl object-cover border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">{name}</p>
                          {/* Variant attributes */}
                          {(attributes.color || attributes.size || attributes.fabric) && (
                            <div className="flex flex-wrap gap-2 mt-1 text-xs">
                              {attributes.color && (
                                <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                                  <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: attributes.color }}
                                  />
                                  {getColorName(attributes.color)}
                                </span>
                              )}
                              {attributes.size && (
                                <span className="bg-muted px-2 py-0.5 rounded-full">
                                  Size: {attributes.size}
                                </span>
                              )}
                              {attributes.fabric && (
                                <span className="bg-muted px-2 py-0.5 rounded-full capitalize">
                                  {attributes.fabric}
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Qty: {qty} • {formatPrice(price)}
                          </p>
                        </div>
                        <p className="font-bold">{formatPrice(price * qty)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
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
                    <span>{formatPrice(calcTotal(activeOrder))}</span>
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

export default Orders;