import { useEffect, useState } from "react";
import { Link } from "wouter";
import { FileText, Folder, Box, Mail, Eye, Heart, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminFetch } from "@/lib/admin";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface Stats {
  posts: { total: number; published: number; drafts: number; views: number; likes: number };
  categories: number;
  resources: number;
  subscribers: number;
}

interface AdminPost {
  id: number;
  slug: string;
  title: string;
  categoryName: string;
  views: number;
  likes: number;
  published: boolean;
  publishedAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<AdminPost[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([
          adminFetch<Stats>("/admin/stats"),
          adminFetch<{ items: AdminPost[] }>("/admin/posts"),
        ]);
        setStats(s);
        setRecent(p.items.slice(0, 5));
      } catch {
        /* handled by layout */
      }
    })();
  }, []);

  const cards = [
    {
      label: "Total Posts",
      value: stats?.posts.total ?? "—",
      sub: `${stats?.posts.published ?? 0} published · ${stats?.posts.drafts ?? 0} drafts`,
      icon: FileText,
    },
    {
      label: "Total Views",
      value: stats?.posts.views?.toLocaleString() ?? "—",
      sub: `${stats?.posts.likes ?? 0} likes`,
      icon: Eye,
    },
    {
      label: "Categories",
      value: stats?.categories ?? "—",
      sub: `${stats?.resources ?? 0} resources`,
      icon: Folder,
    },
    {
      label: "Subscribers",
      value: stats?.subscribers ?? "—",
      sub: "Newsletter list",
      icon: Mail,
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-serif font-bold">{c.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold">Recent Posts</h2>
            <Link href="/admin/posts">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="divide-y">
            {recent.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.categoryName} ·{" "}
                    {p.published ? (
                      <span className="text-emerald-600">Published</span>
                    ) : (
                      <span className="text-amber-600">Draft</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {p.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {p.likes}
                  </span>
                  <Link href={`/admin/edit/${p.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <p className="py-8 text-center text-muted-foreground text-sm">
                No posts yet.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/new">
              <Button className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" /> New Post
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" className="w-full justify-start">
                <Folder className="w-4 h-4 mr-2" /> Manage Categories
              </Button>
            </Link>
            <Link href="/admin/resources">
              <Button variant="outline" className="w-full justify-start">
                <Box className="w-4 h-4 mr-2" /> Manage Resources
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
