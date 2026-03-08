// src/pages/Checkout.tsx
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Truck,
  Tag,
  MapPin,
  Phone,
  User,
  Home,
  Wallet,
  BadgeCheck,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "https://api.jsgallor.com";

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
};

type SavedAddress = AddressForm & {
  _id: string;
  userId: string;
  isDefault?: boolean;
  createdAt?: string;
};

type PaymentMethod = "cod" | "razorpay";

type ApplyCouponResponse = {
  success: boolean;
  message?: string;
  coupon?: {
    id: string;
    code: string;
    type: "percentage" | "flat" | "free_shipping";
    value: number;
    maxDiscount?: number;
    website?: string;
  };
  discount?: number;
  shippingDiscount?: number;
  finalAmount?: number;
  finalShipping?: number;
};

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);

    const id = "razorpay-checkout-js";
    const existing = document.getElementById(id);
    if (existing) return resolve(true);

    const script = document.createElement("script");
    script.id = id;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ApplyCouponResponse["coupon"] | null>(null);
  const [discount, setDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [address, setAddress] = useState<AddressForm>({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [placingOrder, setPlacingOrder] = useState(false);

  const shippingCost = useMemo(() => (subtotal >= 5000 ? 0 : 299), [subtotal]);

  const finalShipping = useMemo(
    () => Math.max(0, shippingCost - shippingDiscount),
    [shippingCost, shippingDiscount]
  );

  const total = useMemo(
    () => Math.max(0, subtotal - discount + finalShipping),
    [subtotal, discount, finalShipping]
  );

  const getAuth = () => {
    const token = localStorage.getItem("affordable_token");
    const userRaw = localStorage.getItem("affordable_user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const userId = user?._id || user?.id || null;
    return { token, userId, user };
  };

  const fetchAddresses = async () => {
    const { token, userId } = getAuth();
    if (!token || !userId) return;

    try {
      setLoadingAddresses(true);
      const res = await fetch(`${API_BASE}/api/affordable/address/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load addresses");

      const list: SavedAddress[] = Array.isArray(data) ? data : data.addresses || [];
      setAddresses(list);

      if (!selectedAddressId && list.length > 0) {
        const def = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(def._id);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load addresses");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const validateAddress = (a: AddressForm) => {
    const required: Array<keyof AddressForm> = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
    ];

    for (const f of required) {
      if (!String(a[f] || "").trim()) return false;
    }
    if (!/^\d{10}$/.test(a.phone.trim())) return false;
    if (!/^\d{6}$/.test(a.pincode.trim())) return false;
    if (a.email.trim() && !/^\S+@\S+\.\S+$/.test(a.email.trim())) return false;
    return true;
  };

  const saveNewAddress = async () => {
    const { token, userId } = getAuth();
    if (!token || !userId) {
      toast.error("Please login to save address");
      return;
    }

    if (!validateAddress(address)) {
      toast.error("Please fill a valid delivery address");
      return;
    }

    try {
      setSavingAddress(true);
      const res = await fetch(`${API_BASE}/api/affordable/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, ...address }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save address");

      const created: SavedAddress = data.address || data;

      await fetchAddresses();
      if (created?._id) setSelectedAddressId(created._id);

      setShowAddAddress(false);
      toast.success("Address saved");

      setAddress({
        fullName: "",
        phone: "",
        email: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  useEffect(() => {
    if (step === 2) fetchAddresses();
  }, [step]);

  useEffect(() => {
    if (!appliedCoupon?.code) return;
    reApplyCoupon();
  }, [subtotal, shippingCost]);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    const { userId } = getAuth();

    try {
      setApplyingCoupon(true);

      const res = await fetch(`${API_BASE}/api/affordable/coupons/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          cartTotal: subtotal,
          shipping: shippingCost,
          userId: userId || undefined,
        }),
      });

      const data: ApplyCouponResponse = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to apply coupon");

      setAppliedCoupon(data.coupon || null);
      setDiscount(Number(data.discount || 0));
      setShippingDiscount(Number(data.shippingDiscount || 0));

      toast.success(`Coupon applied: ${data?.coupon?.code || code}`);
    } catch (e: any) {
      setAppliedCoupon(null);
      setDiscount(0);
      setShippingDiscount(0);
      toast.error(e?.message || "Invalid coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const reApplyCoupon = async () => {
    const code = appliedCoupon?.code || couponCode.trim().toUpperCase();
    if (!code) return;

    const { userId } = getAuth();

    try {
      const res = await fetch(`${API_BASE}/api/affordable/coupons/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          cartTotal: subtotal,
          shipping: shippingCost,
          userId: userId || undefined,
        }),
      });
      const data: ApplyCouponResponse = await res.json();
      if (!res.ok) throw new Error(data?.message || "Coupon invalid");

      setAppliedCoupon(data.coupon || null);
      setDiscount(Number(data.discount || 0));
      setShippingDiscount(Number(data.shippingDiscount || 0));
    } catch {
      setAppliedCoupon(null);
      setDiscount(0);
      setShippingDiscount(0);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setShippingDiscount(0);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handleProceedFromCart = () => {
    if (!items?.length) {
      toast.error("Your cart is empty");
      return;
    }
    setStep(2);
  };

  const handleProceedFromAddress = () => {
    if (selectedAddressId) {
      setStep(3);
      return;
    }
    if (showAddAddress && validateAddress(address)) {
      setStep(3);
      return;
    }
    toast.error("Please select an address or add a new one");
  };

  const buildOrderPayload = (args?: {
    payment?: any;
    razorpay?: {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };
    paymentStatus?: "paid" | "pending";
  }) => {
    const { userId } = getAuth();

    const orderItems = items.map((it: any) => {
      const snap = it.productSnapshot || {};
      const price = Number(snap.price ?? snap.salesPrice ?? 0);
      const finalPrice = Number(
        snap.afterDiscount ?? snap.finalPrice ?? snap.price ?? snap.salesPrice ?? 0
      );

      return {
        productId: it.productId,
        quantity: Number(it.quantity || 1),
        price,
        finalPrice,
        productSnapshot: snap,
      };
    });

    return {
      userId,
      addressId: selectedAddressId,
      items: orderItems,
      coupon: appliedCoupon?.code
        ? {
            code: appliedCoupon.code,
            couponId: appliedCoupon.id,
            type: appliedCoupon.type,
          }
        : undefined,
      pricing: {
        subtotal,
        discount,
        shippingCost,
        shippingDiscount,
        total,
      },
      payment: {
        method: paymentMethod,
        status: args?.paymentStatus || (paymentMethod === "cod" ? "pending" : "paid"),
        ...(args?.razorpay
          ? {
              razorpayOrderId: args.razorpay.razorpay_order_id,
              razorpayPaymentId: args.razorpay.razorpay_payment_id,
              razorpaySignature: args.razorpay.razorpay_signature,
            }
          : {}),
        ...(args?.payment || {}),
      },
    };
  };

  const createOrderInBackend = async (payload: any) => {
    const { token } = getAuth();
    const res = await fetch(`${API_BASE}/api/affordable/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to place order");
    return data;
  };

  const payWithRazorpay = async () => {
    const { token, userId, user } = getAuth();
    if (!token || !userId) {
      toast.error("Please login to place order");
      return;
    }

    const ok = await loadRazorpayScript();
    if (!ok) throw new Error("Razorpay SDK failed to load");

    const createRes = await fetch(`${API_BASE}/api/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(total),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { website: "affordable" },
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok || !createData?.success) {
      throw new Error(createData?.message || "Failed to create Razorpay order");
    }

    const { order, keyId } = createData;

    const options: any = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "JSGALORE",
      description: "Order Payment",
      order_id: order.id,
      prefill: {
        name: user?.name || user?.fullName || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      theme: { color: "#111827" },
      handler: async (response: any) => {
        try {
          const verifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData?.success) {
            throw new Error(verifyData?.message || "Payment verification failed");
          }

          const payload = buildOrderPayload({
            razorpay: response,
            paymentStatus: "paid",
            payment: {
              gateway: "razorpay",
            },
          });

          const data = await createOrderInBackend(payload);

          toast.success("Payment success ✅ Order placed!");
          await clearCart();

          navigate("/order-success", {
            state: {
              order: data.order || data,
              total,
              shippingCost,
              shippingDiscount,
              discount,
              couponCode: appliedCoupon?.code || "",
              razorpay: response,
            },
          });
        } catch (err: any) {
          toast.error(err?.message || "Payment done but order creation failed");
        } finally {
          setPlacingOrder(false);
        }
      },
      modal: {
        ondismiss: () => {
          setPlacingOrder(false);
          toast.message("Payment cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePlaceOrder = async () => {
    const { token, userId } = getAuth();
    if (!token || !userId) {
      toast.error("Please login to place order");
      return;
    }

    if (!selectedAddressId && !(showAddAddress && validateAddress(address))) {
      toast.error("Please select an address or add a new one");
      setStep(2);
      return;
    }

    try {
      setPlacingOrder(true);

      let addressIdToUse = selectedAddressId;

      if (!addressIdToUse && showAddAddress) {
        await saveNewAddress();
        await fetchAddresses();
        addressIdToUse = selectedAddressId;
      }

      if (!addressIdToUse) {
        toast.error("Could not resolve address. Please try again.");
        setStep(2);
        setPlacingOrder(false);
        return;
      }

      if (paymentMethod === "cod") {
        const payload = {
          ...buildOrderPayload({ paymentStatus: "pending" }),
          addressId: addressIdToUse,
        };

        const data = await createOrderInBackend(payload);

        toast.success("Order placed successfully! Thank you for shopping with JSGALORE.");
        await clearCart();

        navigate("/order-success", {
          state: {
            order: data.order || data,
            total,
            shippingCost,
            shippingDiscount,
            discount,
            couponCode: appliedCoupon?.code || "",
          },
        });

        setPlacingOrder(false);
        return;
      }

      await payWithRazorpay();
    } catch (e: any) {
      toast.error(e?.message || "Order failed");
      setPlacingOrder(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Link to="/">
              <Button variant="hero" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6 flex flex-wrap items-center gap-y-1">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Checkout</span>
        </nav>

        <div className="flex flex-col gap-3 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>

          {/* Stepper */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3 text-xs sm:text-sm">
            <div
              className={`flex flex-col sm:flex-row items-center gap-2 ${
                step >= 1 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs sm:text-sm ${
                  step >= 1
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border"
                }`}
              >
                1
              </div>
              <span className="font-medium text-center">Cart</span>
            </div>

            <div className="hidden sm:block h-px flex-1 bg-border" />

            <div
              className={`flex flex-col sm:flex-row items-center gap-2 ${
                step >= 2 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs sm:text-sm ${
                  step >= 2
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border"
                }`}
              >
                2
              </div>
              <span className="font-medium text-center">Address</span>
            </div>

            <div className="hidden sm:block h-px flex-1 bg-border" />

            <div
              className={`flex flex-col sm:flex-row items-center gap-2 ${
                step >= 3 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs sm:text-sm ${
                  step >= 3
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border"
                }`}
              >
                3
              </div>
              <span className="font-medium text-center">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted rounded-xl text-sm font-medium text-muted-foreground">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {items.map((item: any) => {
                  const pid = item.productId;
                  const snap = item.productSnapshot || {};
                  const name = snap.name || "Product";
                  const price = Number(snap.price || 0);
                  const image = snap.image || "";
                  const category = snap.category || "";
                  const inStock = snap.inStock !== false;

                  return (
                    <div
                      key={pid}
                      className="p-4 bg-card rounded-2xl border border-border"
                    >
                      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center">
                        <div className="md:col-span-5 flex items-start sm:items-center gap-3 sm:gap-4">
                          <Link to={`/product/${pid}`} className="shrink-0">
                            <img
                              src={image}
                              alt={name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover"
                            />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              to={`/product/${pid}`}
                              className="font-medium hover:text-primary transition-colors line-clamp-2"
                            >
                              {name}
                            </Link>
                            {category && (
                              <p className="text-sm text-muted-foreground capitalize">
                                {String(category).replace(/-/g, " ")}
                              </p>
                            )}
                            {!inStock && (
                              <p className="text-xs text-destructive mt-1">Out of Stock</p>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2 flex justify-between md:block md:text-center">
                          <span className="md:hidden text-sm text-muted-foreground">Price</span>
                          <span className="font-medium">{formatPrice(price)}</span>
                        </div>

                        <div className="md:col-span-3 flex items-center justify-between md:justify-center gap-3">
                          <span className="md:hidden text-sm text-muted-foreground">Quantity</span>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-border rounded-xl">
                              <button
                                onClick={() => updateQuantity(pid, item.quantity - 1)}
                                className="p-2 hover:bg-muted transition-colors rounded-l-xl"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(pid, item.quantity + 1)}
                                className="p-2 hover:bg-muted transition-colors rounded-r-xl"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(pid)}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-2 flex justify-between md:block md:text-right">
                          <span className="md:hidden text-sm text-muted-foreground">Subtotal</span>
                          <span className="font-bold">
                            {formatPrice(price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Coupon */}
                <div className="mt-6 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="pl-10"
                        disabled={!!appliedCoupon}
                      />
                    </div>

                    {!appliedCoupon ? (
                      <Button
                        variant="outline"
                        onClick={applyCoupon}
                        disabled={applyingCoupon}
                        className="w-full sm:w-auto"
                      >
                        {applyingCoupon ? "Applying..." : "Apply"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={removeCoupon}
                        className="gap-2 w-full sm:w-auto"
                      >
                        <XCircle className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="text-sm text-green-600">
                      Applied <span className="font-semibold">{appliedCoupon.code}</span> • Saved{" "}
                      <span className="font-semibold">
                        {formatPrice(discount + shippingDiscount)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Use a valid coupon created by Admin Panel.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <Link to="/" className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                  <Button variant="hero" onClick={handleProceedFromCart} className="w-full sm:w-auto">
                    Continue to Address
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-bold">Delivery Address</h2>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowAddAddress((s) => !s)}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {showAddAddress ? "Close" : "Add Address"}
                  </Button>
                </div>

                <div className="space-y-3">
                  {loadingAddresses ? (
                    <div className="text-sm text-muted-foreground">Loading addresses...</div>
                  ) : addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {addresses.map((a) => (
                        <button
                          key={a._id}
                          type="button"
                          onClick={() => setSelectedAddressId(a._id)}
                          className={`text-left p-4 rounded-2xl border transition-colors ${
                            selectedAddressId === a._id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold break-words">{a.fullName}</p>
                              <p className="text-sm text-muted-foreground">{a.phone}</p>
                            </div>
                            {selectedAddressId === a._id && (
                              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                            )}
                          </div>

                          <p className="text-sm mt-2 break-words">
                            {a.addressLine1}
                            {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                          </p>
                          <p className="text-sm break-words">
                            {a.city}, {a.state} - {a.pincode}
                          </p>
                          {a.landmark && (
                            <p className="text-xs text-muted-foreground mt-1 break-words">
                              Landmark: {a.landmark}
                            </p>
                          )}
                          {a.isDefault && (
                            <p className="text-xs text-primary mt-2 font-medium">
                              Default Address
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No saved address found. Please add a new address.
                    </div>
                  )}
                </div>

                {showAddAddress && (
                  <div className="border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold">Add New Address</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="Full Name *"
                          value={address.fullName}
                          onChange={(e) =>
                            setAddress((p) => ({ ...p, fullName: e.target.value }))
                          }
                        />
                      </div>

                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="Phone (10 digits) *"
                          value={address.phone}
                          onChange={(e) =>
                            setAddress((p) => ({
                              ...p,
                              phone: e.target.value.replace(/[^\d]/g, ""),
                            }))
                          }
                          maxLength={10}
                        />
                      </div>

                      <div className="relative md:col-span-2">
                        <Home className="absolute left-3 top-1/2 md:top-4 -translate-y-1/2 md:translate-y-0 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="Address Line 1 *"
                          value={address.addressLine1}
                          onChange={(e) =>
                            setAddress((p) => ({
                              ...p,
                              addressLine1: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          placeholder="Address Line 2"
                          value={address.addressLine2}
                          onChange={(e) =>
                            setAddress((p) => ({
                              ...p,
                              addressLine2: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <Input
                        placeholder="City *"
                        value={address.city}
                        onChange={(e) =>
                          setAddress((p) => ({ ...p, city: e.target.value }))
                        }
                      />

                      <Input
                        placeholder="State *"
                        value={address.state}
                        onChange={(e) =>
                          setAddress((p) => ({ ...p, state: e.target.value }))
                        }
                      />

                      <Input
                        placeholder="Pincode (6 digits) *"
                        value={address.pincode}
                        onChange={(e) =>
                          setAddress((p) => ({
                            ...p,
                            pincode: e.target.value.replace(/[^\d]/g, ""),
                          }))
                        }
                        maxLength={6}
                      />

                      <Input
                        placeholder="Landmark"
                        value={address.landmark}
                        onChange={(e) =>
                          setAddress((p) => ({ ...p, landmark: e.target.value }))
                        }
                      />

                      <Input
                        placeholder="Email (optional)"
                        value={address.email}
                        onChange={(e) =>
                          setAddress((p) => ({ ...p, email: e.target.value }))
                        }
                        className="md:col-span-2"
                      />
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        variant="hero"
                        onClick={saveNewAddress}
                        disabled={savingAddress}
                        className="gap-2 w-full sm:w-auto"
                      >
                        {savingAddress ? "Saving..." : "Save Address"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-1">
                  <Button variant="outline" onClick={() => setStep(1)} className="w-full sm:w-auto">
                    Back to Cart
                  </Button>
                  <Button variant="hero" onClick={handleProceedFromAddress} className="w-full sm:w-auto">
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold">Payment</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-4 rounded-2xl border text-left transition-colors ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <Wallet className="h-4 w-4" />
                      Cash on Delivery
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay when you receive
                    </p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`p-4 rounded-2xl border text-left transition-colors ${
                      paymentMethod === "razorpay"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <BadgeCheck className="h-4 w-4" />
                      Online Payment (Razorpay)
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      UPI / Card / NetBanking / Wallets
                    </p>
                  </button>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={placingOrder}
                    className="w-full sm:w-auto"
                  >
                    Back to Address
                  </Button>

                  <Button
                    variant="hero"
                    onClick={handlePlaceOrder}
                    className="w-full sm:w-auto sm:min-w-[200px]"
                    disabled={placingOrder}
                  >
                    {placingOrder ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6">Order Summary</h2>

              <div className="flex items-start gap-3 p-3 bg-amber-light/50 rounded-xl mb-6">
                <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  {subtotal >= 5000 ? (
                    <span className="text-green-600 font-medium">
                      Free shipping on this order!
                    </span>
                  ) : (
                    <span>Add {formatPrice(5000 - subtotal)} more for free shipping</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-right">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-right">
                    {finalShipping === 0 ? "FREE" : formatPrice(finalShipping)}
                  </span>
                </div>

                {(discount > 0 || shippingDiscount > 0) && (
                  <div className="flex justify-between gap-3 text-green-600">
                    <span>Discount</span>
                    <span className="text-right">-{formatPrice(discount + shippingDiscount)}</span>
                  </div>
                )}

                {appliedCoupon?.code && (
                  <div className="text-xs text-muted-foreground break-words">
                    Coupon:{" "}
                    <span className="font-medium text-foreground">{appliedCoupon.code}</span>
                  </div>
                )}

                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between gap-3 text-base sm:text-lg font-bold">
                    <span>Total</span>
                    <span className="text-right">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {step === 1 && (
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleProceedFromCart}
                  >
                    Continue to Address
                  </Button>
                )}

                {step === 2 && (
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleProceedFromAddress}
                  >
                    Continue to Payment
                  </Button>
                )}

                {step === 3 && (
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                  >
                    {placingOrder ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
                      </>
                    )}
                  </Button>
                )}

                <Link to="/" className="block">
                  <Button variant="ghost" className="w-full" disabled={placingOrder}>
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;