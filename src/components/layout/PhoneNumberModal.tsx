import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Phone } from "lucide-react";

interface PhoneNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PhoneNumberModal = ({ open, onOpenChange }: PhoneNumberModalProps) => {
  const { user, updateProfile } = useAuth();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const success = await updateProfile({ phone });
      if (success) {
        toast.success("Phone number added successfully!");
        onOpenChange(false);
      } else {
        toast.error("Failed to update phone number");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update phone number");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Temporarily skip for this session
    sessionStorage.setItem("skipPhoneModal", "true");
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please add your phone number to help us serve you better.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="pl-10 h-12 rounded-xl"
                required
                disabled={loading}
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground">We'll never share your phone number.</p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={handleSkip} disabled={loading}>
              Skip for now
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};