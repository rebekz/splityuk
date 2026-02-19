"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { QRCodeDisplay } from "./QRCode";

interface ShareModalProps {
  shareCode: string;
  billName: string;
}

export function ShareModal({ shareCode, billName }: ShareModalProps) {
  const [open, setOpen] = useState(false);
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/b/${shareCode}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link berhasil disalin!");
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Yuk bagi tagihan "${billName}" di SplitYuk!\n\nBuka: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Bagikan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bagikan Tagihan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center py-4">
            <QRCodeDisplay value={shareUrl} size={180} />
          </div>

          {/* Share Link */}
          <div className="flex items-center space-x-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button onClick={copyLink} size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* WhatsApp Button */}
          <Button
            onClick={shareWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Bagikan ke WhatsApp
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Siapa saja dengan link ini dapat melihat dan berpartisipasi dalam tagihan
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
