import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Truck, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Checkout = () => {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const shippingCost = subtotal > 5000 ? 0 : 299;
  const total = subtotal - discount + shippingCost;

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "JSGALORE20") {
      const discountAmount = subtotal * 0.2;
      setDiscount(discountAmount);
      toast.success("Coupon applied! 20% discount");
    } else if (couponCode.toUpperCase() === "FIRST10") {
      const discountAmount = subtotal * 0.1;
      setDiscount(discountAmount);
      toast.success("Coupon applied! 10% discount");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleCheckout = () => {
    toast.success("Order placed successfully! Thank you for shopping with JSGALORE.");
    clearCart();
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
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
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Checkout</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted rounded-xl text-sm font-medium text-muted-foreground">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {/* Cart items */}
            {items.map((item) => (
              <div
                key={item.id}
                className="grid md:grid-cols-12 gap-4 p-4 bg-card rounded-2xl border border-border items-center"
              >
                {/* Product */}
                <div className="md:col-span-5 flex items-center gap-4">
                  <Link to={`/product/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/product/${item.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.category.replace("-", " ")}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="md:col-span-2 text-center">
                  <span className="md:hidden text-sm text-muted-foreground mr-2">Price:</span>
                  <span className="font-medium">{formatPrice(item.price)}</span>
                </div>

                {/* Quantity */}
                <div className="md:col-span-3 flex items-center justify-center gap-2">
                  <div className="flex items-center border border-border rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-muted transition-colors rounded-l-xl"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-muted transition-colors rounded-r-xl"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="md:col-span-2 text-right">
                  <span className="md:hidden text-sm text-muted-foreground mr-2">Subtotal:</span>
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div className="flex gap-2 mt-6">
              <div className="relative flex-1 max-w-sm">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={applyCoupon}>
                Apply
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Try: JSGALORE20 for 20% off or FIRST10 for 10% off
            </p>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Shipping info */}
              <div className="flex items-center gap-3 p-3 bg-amber-light/50 rounded-xl mb-6">
                <Truck className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  {subtotal >= 5000 ? (
                    <span className="text-green-600 font-medium">Free shipping on this order!</span>
                  ) : (
                    <span>Add {formatPrice(5000 - subtotal)} more for free shipping</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment icons */}
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">We accept</p>
                <div className="flex gap-2">
                  {["Visa", "MC", "UPI", "Pay"].map((method) => (
                    <div
                      key={method}
                      className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium"
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-6"
                onClick={handleCheckout}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Payment
              </Button>

              <Link to="/">
                <Button variant="ghost" className="w-full mt-2">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
