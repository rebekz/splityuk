"use client";

import { BillForm } from "@/components/BillForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewBillPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <button className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Buat Tagihan Baru</h1>
      </div>
      
      <BillForm />
    </div>
  );
}
