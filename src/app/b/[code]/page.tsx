"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GuestJoin } from "@/components/GuestJoin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Bill {
  id: string;
  code: string;
  title: string;
  description?: string;
  totalAmount: number;
  items: BillItem[];
  participants: { id: string; displayName: string }[];
}

export default function PublicBillPage() {
  const params = useParams();
  const billCode = params.code as string;
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already joined
    const participantId = localStorage.getItem(`participant_${billCode}`);
    if (participantId) {
      const savedName = localStorage.getItem(`participant_${billCode}_name`);
      if (savedName) {
        setParticipantName(savedName);
        setIsJoined(true);
      }
    }
  }, [billCode]);

  useEffect(() => {
    async function fetchBill() {
      try {
        const response = await fetch(`/api/bills/code/${billCode}`);
        if (response.ok) {
          const data = await response.json();
          setBill(data);
        } else if (response.status === 404) {
          setError("Bill not found");
        }
      } catch (err) {
        console.error("Failed to fetch bill:", err);
        setError("Failed to load bill");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBill();
  }, [billCode]);

  const handleJoin = (participantId: string, displayName: string) => {
    localStorage.setItem(`participant_${billCode}_name`, displayName);
    setParticipantName(displayName);
    setIsJoined(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">You've been invited!</h1>
          <p className="text-muted-foreground">
            Join to view and split the bill: {bill?.title || `Bill ${billCode}`}
          </p>
        </div>
        <GuestJoin billCode={billCode} onJoin={handleJoin} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{bill?.title || "Shared Bill"}</h1>
          <Badge variant="secondary">{billCode}</Badge>
        </div>
        <p className="text-muted-foreground">
          Welcome, {participantName}!
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bill Summary</CardTitle>
          <CardDescription>
            {bill?.participants.length || 0} participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bill?.items?.length ? (
            <div className="space-y-3">
              {bill.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>Rp {item.price.toLocaleString("id-ID")}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rp {(bill?.totalAmount || 0).toLocaleString("id-ID")}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No items yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Share</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-4">
            Rp {((bill?.totalAmount || 0) / Math.max(bill?.participants.length || 1, 1)).toLocaleString("id-ID")}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Split evenly among {bill?.participants.length || 1} participants
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
