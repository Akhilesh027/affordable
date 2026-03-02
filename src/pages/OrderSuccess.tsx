import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  Home as HomeIcon,
} from "lucide-react";
import { useMemo } from "react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as any;

  // When user directly opens /order-success without state
  const order = state?.order || null;

  const totals = useMemo(() => {
    const subtotal = order?.pricing?.subtotal ?? state?.subtotal ?? 0;
    const discount = order?.pricing?.discount ?? state?.discount ?? 0;
    const shippingCost = order?.pricing?.shippingCost ?? state?.shippingCost ?? 0;
    const total = order?.pricing?.total ?? state?.total ?? subtotal - discount + shippingCost;

    return { subtotal, discount, shippingCost, total };
  }, [order, state]);

  const address = order?.addressId || state?.address || null;
  const items = order?.items || state?.items || [];

  if (!order && !state) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-xl mx-auto text-center bg-card border border-border rounded-2xl p-10">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">No order found</h1>
            <p className="text-muted-foreground mb-6">
              This page is shown after checkout. Please place an order first.
            </p>
            <Link to="/">
              <Button variant="hero" size="lg">
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const orderId = order?._id || order?.orderId || "—";
  const paymentMethod = order?.payment?.method || state?.paymentMethod || "cod";
  const paymentStatus = order?.payment?.status || "pending";
  const orderStatus = order?.status || "placed";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        {/* Top success card */}
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                Order placed successfully 🎉
              </h1>
              <p className="text-muted-foreground mt-1">
                Thanks for shopping with JSGALORE. We’ve received your order and will
                start processing it soon.
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-muted text-foreground border border-border">
                  Order ID: <span className="font-semibold">{orderId}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-foreground border border-border">
                  Status: <span className="font-semibold capitalize">{orderStatus}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-foreground border border-border">
                  Payment:{" "}
                  <span className="font-semibold uppercase">
                    {paymentMethod === "cod" ? "COD" : paymentMethod}
                  </span>{" "}
                  • <span className="font-semibold capitalize">{paymentStatus}</span>
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto flex gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                <HomeIcon className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="hero" onClick={() => navigate("/orders")}>
                View Orders
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 mt-8">
          {/* Address */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Delivery Address</h2>
            </div>

            {address ? (
              <div className="text-sm">
                <p className="font-semibold">
                  {address.fullName || address.name || "—"}
                </p>
                {address.phone && (
                  <p className="text-muted-foreground">{address.phone}</p>
                )}
                <p className="mt-3">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                </p>
                <p>
                  {address.city}, {address.state} - {address.pincode}
                </p>
                {address.landmark && (
                  <p className="text-muted-foreground mt-2">
                    Landmark: {address.landmark}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Address not available</p>
            )}
          </div>

          {/* Payment summary */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Payment Summary</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {totals.shippingCost === 0 ? "FREE" : formatPrice(totals.shippingCost)}
                </span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(totals.discount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-muted text-sm">
              <span className="text-muted-foreground">Method:</span>{" "}
              <span className="font-semibold uppercase">
                {paymentMethod === "cod" ? "COD" : paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Items list */}
        <div className="max-w-3xl mx-auto mt-8 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Order Items</h2>
          </div>

          <div className="space-y-4">
            {items.map((it: any) => {
              const snap = it.productSnapshot || {};
              const pid = it.productId?._id || it.productId || snap._id || "";
              const name = snap.name || "Product";
              const image = snap.image || "";
              const price = Number(snap.price || 0);
              const qty = Number(it.quantity || 1);

              return (
                <div
                  key={String(pid) + String(name)}
                  className="flex items-center gap-4 p-3 rounded-2xl border border-border"
                >
                  <img
                    src={image}
                    alt={name}
                    className="w-16 h-16 rounded-xl object-cover border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold line-clamp-1">{name}</p>
                    {snap.category && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {String(snap.category).replace(/-/g, " ")}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Qty: <span className="font-medium text-foreground">{qty}</span>
                      {"  "}•{"  "}
                      Price:{" "}
                      <span className="font-medium text-foreground">
                        {formatPrice(price)}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-base font-bold">
                      {formatPrice(price * qty)}
                    </p>

                    {pid ? (
                      <Link to={`/product/${pid}`} className="text-xs text-primary hover:underline">
                        View product
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="max-w-3xl mx-auto mt-8 flex flex-col sm:flex-row gap-3 justify-end">
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
          <Button variant="hero" className="w-full sm:w-auto" onClick={() => navigate("/orders")}>
            Go to My Orders
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
