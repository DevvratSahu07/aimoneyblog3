import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, ExternalLink, Search, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface AdminPost {
  id: number;
  slug: string;
  title: string;
  categoryName: string;
  views: number;
  likes: number;
  premium: boolean;
  featured: boolean;
  published: boolean;
  publishedAt: string;
}

export default function AdminPosts() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminPost[]>([]);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");

  async function load() {
    const res = await adminFetch<{ items: AdminPost[] }>("/admin/posts");
    setItems(res.items);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (filter === "published" && !p.published) return false;
      if (filter === "draft" && p.published) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, filter, search]);

  async function togglePublished(p: AdminPost) {
    try {
      await adminFetch(`/admin/posts/${p.id}`, {
        method: "PUT",
        body: JSON.stringify({ published: !p.published }),
      });
      toast({ title: p.published ? "Moved to drafts" : "Post published" });
      await load();
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  async function handleDelete(p: AdminPost) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      await adminFetch(`/admin/posts/${p.id}`, { method: "DELETE" });
      toast({ title: "Post deleted" });
      await load();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  return (
    <AdminLayout title="Posts">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-1 bg-muted p-1 rounded-md">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                filter === f ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/admin/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New
            </Button>
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Stats</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground space-x-1 mt-0.5">
                      <span>/{p.slug}</span>
                      {p.featured && <Badge variant="secondary" className="ml-1">Featured</Badge>}
                      {p.premium && <Badge className="ml-1">Premium</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.categoryName}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(p)}
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        p.published
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                      title="Click to toggle"
                    >
                      {p.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs space-x-3">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {p.views}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {p.likes}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {p.published && (
                        <Link href={`/blog/${p.slug}`}>
                          <Button variant="ghost" size="icon" title="View">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/edit/${p.id}`}>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => handleDelete(p)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No posts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
