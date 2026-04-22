import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch } from "@/lib/admin";
import { buildApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const ICON_OPTIONS = [
  "Sparkles", "Rocket", "TrendingUp", "Folder", "Box", "BookOpen",
  "Lightbulb", "Briefcase", "Code", "PenTool", "Mic", "Video",
];

const empty = { name: "", slug: "", description: "", color: "#10B981", icon: "Sparkles" };

export default function AdminCategories() {
  const { toast } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  async function load() {
    const res = await fetch(buildApiUrl("/categories"));
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

  function startEdit(c: Category) {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description,
      color: c.color,
      icon: c.icon,
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await adminFetch(`/admin/categories/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast({ title: "Category updated" });
      } else {
        await adminFetch(`/admin/categories`, {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast({ title: "Category created" });
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

  async function remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await adminFetch(`/admin/categories/${c.id}`, { method: "DELETE" });
      toast({ title: "Category deleted" });
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
    <AdminLayout title="Categories">
      <div className="flex justify-end mb-4">
        <Button onClick={startNew}>
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: c.color }}
              >
                {c.name.charAt(0)}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(c)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(c)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <h3 className="font-bold text-lg">{c.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">/{c.slug}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{c.description}</p>
          </Card>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <Card
            className="w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-bold">
                {editing ? "Edit Category" : "New Category"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
                  <Label>Color *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-14 p-1"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                    />
                    <Input
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Icon *</Label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  >
                    {ICON_OPTIONS.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
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
