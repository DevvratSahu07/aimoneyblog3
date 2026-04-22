import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/admin";
import { buildApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
  pricing: string;
  tags: string[];
  logo: string;
}

const PRICING = ["Free", "Freemium", "Paid", "Free trial"];

const empty = {
  title: "",
  description: "",
  url: "",
  category: "",
  pricing: "Freemium",
  tags: "",
  logo: "https://api.dicebear.com/7.x/icons/svg?seed=tool",
};

export default function AdminResources() {
  const { toast } = useToast();
  const [items, setItems] = useState<Resource[]>([]);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  async function load() {
    const res = await fetch(buildApiUrl("/resources"));
    setItems(await res.json());
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  function startNew() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function startEdit(r: Resource) {
    setEditing(r);
    setForm({
      title: r.title,
      description: r.description,
      url: r.url,
      category: r.category,
      pricing: r.pricing,
      tags: r.tags.join(", "),
      logo: r.logo,
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await adminFetch(`/admin/resources/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast({ title: "Resource updated" });
      } else {
        await adminFetch(`/admin/resources`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({ title: "Resource created" });
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  async function remove(r: Resource) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    try {
      await adminFetch(`/admin/resources/${r.id}`, { method: "DELETE" });
      toast({ title: "Resource deleted" });
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
    <AdminLayout title="Resources">
      <div className="flex justify-end mb-4">
        <Button onClick={startNew}>
          <Plus className="w-4 h-4 mr-2" /> New Resource
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Pricing</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.logo}
                        alt={r.title}
                        className="w-8 h-8 rounded border bg-white object-contain"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                      <div>
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                          {r.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{r.pricing}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.tags.slice(0, 3).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" title="Open">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(r)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(r)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No resources yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <Card
            className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-bold">
                {editing ? "Edit Resource" : "New Resource"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Writing, Video"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pricing *</Label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.pricing}
                    onChange={(e) => setForm({ ...form, pricing: e.target.value })}
                  >
                    {PRICING.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo URL *</Label>
                <Input
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="ai, writing, productivity"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editing ? "Update" : "Create"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
