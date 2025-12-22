import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Navigate } from "react-router-dom";
import { User, Package, MapPin, Settings, LogOut } from "lucide-react";
import { useState } from "react";

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ];

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
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg"
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

              {activeTab === "orders" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                  <p className="text-muted-foreground">No orders yet. <Link to="/" className="text-primary hover:underline">Start shopping!</Link></p>
                </div>
              )}

              {activeTab === "addresses" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Saved Addresses</h2>
                  <Button variant="outline">Add New Address</Button>
                </div>
              )}

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
      </div>
    </Layout>
  );
};

export default Profile;
