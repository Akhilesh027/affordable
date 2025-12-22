import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Orders = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const orders = [
    {
      id: "ORD-001",
      date: "Dec 10, 2024",
      total: 45999,
      status: "delivered",
      items: [{ name: "Irithel Modern Sofa Set", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop", qty: 1 }],
    },
    {
      id: "ORD-002",
      date: "Dec 5, 2024",
      total: 32999,
      status: "shipped",
      items: [{ name: "Aurora Dining Table", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=100&h=100&fit=crop", qty: 1 }],
    },
  ];

  const statusConfig = {
    delivered: { icon: CheckCircle, label: "Delivered", className: "bg-green-100 text-green-700" },
    shipped: { icon: Truck, label: "Shipped", className: "bg-blue-100 text-blue-700" },
    processing: { icon: Clock, label: "Processing", className: "bg-yellow-100 text-yellow-700" },
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Link to="/"><Button variant="hero">Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig];
              return (
                <div key={order.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-medium transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{order.id}</span>
                      <span className="text-muted-foreground">{order.date}</span>
                    </div>
                    <Badge className={status.className}>
                      <status.icon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-4 border-t border-dashed border-border">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                      </div>
                      <p className="font-bold">₹{order.total.toLocaleString()}</p>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">Track Order</Button>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
