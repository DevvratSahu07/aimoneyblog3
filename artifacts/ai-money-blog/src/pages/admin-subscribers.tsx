import { useEffect, useMemo, useState } from "react";
import { Download, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
}

export default function AdminSubscribers() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminFetch<{ items: Subscriber[] }>("/admin/subscribers")
      .then((r) => setItems(r.items))
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((s) =>
        search ? s.email.toLowerCase().includes(search.toLowerCase()) : true,
      ),
    [items, search],
  );

  function exportCsv() {
    const csv = ["email,subscribed_at"]
      .concat(filtered.map((s) => `${s.email},${s.createdAt}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout title="Subscribers">
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-5 h-5" />
          <span>{items.length} total subscribers</span>
        </div>
        <div className="flex gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search emails…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={exportCsv} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium text-right">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-12 text-center text-muted-foreground">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </AdminLayout>
  );
}
