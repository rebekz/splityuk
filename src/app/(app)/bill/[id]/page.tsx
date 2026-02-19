import { BillDetail } from "@/components/BillDetail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <button className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Detail Tagihan</h1>
      </div>
      
      <BillDetail billId={id} />
    </div>
  );
}
