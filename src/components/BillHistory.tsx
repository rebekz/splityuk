"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/idr";
import { ArrowLeft, Archive, MoreVertical, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Bill {
  id: string;
  name: string;
  date: Date;
  status: string;
  shareCode: string;
  total?: number;
  participantCount?: number;
}

export function BillHistory() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchBills();
  }, [showArchived]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/bills");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat riwayat tagihan");
    } finally {
      setLoading(false);
    }
  };

  const archiveBill = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!response.ok) throw new Error("Failed to archive");

      toast.success("Tagihan diarsipkan");
      fetchBills();
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengarsipkan tagihan");
    }
  };

  const filteredBills = showArchived
    ? bills.filter((b) => b.status === "archived")
    : bills.filter((b) => b.status !== "archived");

  const statusLabels: Record<string, string> = {
    active: "Aktif",
    draft: "Draft",
    settled: "Selesai",
    archived: "Diarsipkan",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    draft: "bg-gray-100 text-gray-800",
    settled: "bg-blue-100 text-blue-800",
    archived: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <Button
          variant={!showArchived ? "default" : "outline"}
          onClick={() => setShowArchived(false)}
        >
          Aktif
        </Button>
        <Button
          variant={showArchived ? "default" : "outline"}
          onClick={() => setShowArchived(true)}
        >
          <Archive className="mr-2 h-4 w-4" />
          Arsip
        </Button>
      </div>

      {/* Bills List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBills.map((bill) => (
            <Link key={bill.id} href={`/bill/${bill.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{bill.name}</CardTitle>
                      <CardDescription>
                        {new Date(bill.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[bill.status]}>
                      {statusLabels[bill.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold">
                        {formatIDR(bill.total || 0)}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{bill.participantCount || 0}</span>
                      </div>
                    </div>
                    {bill.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          archiveBill(bill.id);
                        }}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {filteredBills.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {showArchived
                    ? "Tidak ada tagihan yang diarsipkan"
                    : "Belum ada tagihan. Buat tagihan pertama!"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
