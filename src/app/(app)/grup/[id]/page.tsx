import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/grup">
          <button className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Detail Grup</h1>
          <p className="text-sm text-muted-foreground">ID: {id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anggota Grup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>0 anggota</span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Fitur detail grup akan segera hadir!
          </p>
        </CardContent>
      </Card>

      <Link href={`/bill/baru?group=${id}`}>
        <Button className="w-full">
          Mulai Tagihan dari Grup Ini
        </Button>
      </Link>
    </div>
  );
}
