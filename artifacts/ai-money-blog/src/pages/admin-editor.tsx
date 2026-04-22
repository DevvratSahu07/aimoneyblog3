import { useEffect, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useListCategories } from "@workspace/api-client-react";
import { ArrowLeft, Save, Eye, FileEdit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminFetch, getAdminToken } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const INCOME_TYPES = ["active", "passive", "hybrid"];

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  difficulty: string;
  incomeType: string;
  tags: string;
  premium: boolean;
  featured: boolean;
  published: boolean;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
}

const empty: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "https://picsum.photos/seed/blog/1200/630",
  categoryId: "",
  difficulty: "beginner",
  incomeType: "active",
  tags: "",
  premium: false,
  featured: false,
  published: true,
  authorName: "Editorial Team",
  authorRole: "Contributor",
  authorAvatar: "",
};

export default function AdminEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/edit/:id");
  const editingId = params?.id ? Number(params.id) : null;
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"write" | "preview">("write");

  const { data: categories } = useListCategories();

  useEffect(() => {
    if (!getAdminToken()) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const post = await adminFetch<Record<string, unknown>>(`/admin/posts/${editingId}`);
        setForm({
          title: String(post["title"] ?? ""),
          slug: String(post["slug"] ?? ""),
          excerpt: String(post["excerpt"] ?? ""),
          content: String(post["content"] ?? ""),
          coverImage: String(post["coverImage"] ?? ""),
          categoryId: String(post["categoryId"] ?? ""),
          difficulty: String(post["difficulty"] ?? "beginner"),
          incomeType: String(post["incomeType"] ?? "active"),
          tags: Array.isArray(post["tags"]) ? (post["tags"] as string[]).join(", ") : "",
          premium: Boolean(post["premium"]),
          featured: Boolean(post["featured"]),
          published: post["published"] === undefined ? true : Boolean(post["published"]),
          authorName: String(post["authorName"] ?? ""),
          authorRole: String(post["authorRole"] ?? ""),
          authorAvatar: String(post["authorAvatar"] ?? ""),
        });
      } catch {
        /* noop */
      }
    })();
  }, [editingId]);

  useEffect(() => {
    if (!form.categoryId && categories && categories.length > 0) {
      setForm((f) => ({ ...f, categoryId: String(categories[0].id) }));
    }
  }, [categories, form.categoryId]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        categoryId: Number(form.categoryId),
        difficulty: form.difficulty,
        incomeType: form.incomeType,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        premium: form.premium,
        featured: form.featured,
        published: form.published,
        authorName: form.authorName,
        authorRole: form.authorRole,
        authorAvatar: form.authorAvatar || undefined,
      };

      if (editingId) {
        await adminFetch(`/admin/posts/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast({ title: form.published ? "Post updated" : "Saved as draft" });
      } else {
        await adminFetch(`/admin/posts`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({ title: form.published ? "Post published" : "Draft created" });
      }
      qc.invalidateQueries();
      setLocation("/admin/posts");
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <Link href="/admin/posts">
        <Button variant="ghost" size="sm" className="mb-4 -ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to posts
        </Button>
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">
            {editingId ? "Edit Post" : "New Post"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Write in Markdown — headings, lists, code, links and images all work.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch
              checked={form.published}
              onCheckedChange={(v) => update("published", v)}
            />
            <span className={form.published ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
              {form.published ? "Published" : "Draft"}
            </span>
          </label>
          <Button onClick={() => handleSubmit()} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving…" : editingId ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="text-lg font-medium"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="auto-from-title"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">Cover image URL *</Label>
              <Input
                id="cover"
                value={form.coverImage}
                onChange={(e) => update("coverImage", e.target.value)}
                required
              />
            </div>
          </div>
          {form.coverImage && (
            <img
              src={form.coverImage}
              alt="cover preview"
              className="w-full max-h-48 object-cover rounded-md border"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content (Markdown) *</Label>
              <div className="flex gap-1 bg-muted p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setView("write")}
                  className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                    view === "write" ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <FileEdit className="w-3 h-3" /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setView("preview")}
                  className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                    view === "preview" ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>
            {view === "write" ? (
              <Textarea
                rows={20}
                className="font-mono text-sm"
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                required
                placeholder="# Your heading\n\nWrite your post here…"
              />
            ) : (
              <div className="min-h-[400px] border rounded-md p-6 bg-background prose dark:prose-invert max-w-none prose-img:rounded-md">
                {form.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold">Classification</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cat">Category *</Label>
              <select
                id="cat"
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                required
              >
                <option value="">Select…</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="diff">Difficulty</Label>
              <select
                id="diff"
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.difficulty}
                onChange={(e) => update("difficulty", e.target.value)}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inc">Income type</Label>
              <select
                id="inc"
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.incomeType}
                onChange={(e) => update("incomeType", e.target.value)}
              >
                {INCOME_TYPES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="passive, case-study, tools"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => update("featured", v)}
              />
              <span>Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={form.premium}
                onCheckedChange={(v) => update("premium", v)}
              />
              <span>Premium</span>
            </label>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold">Author</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aname">Name *</Label>
              <Input
                id="aname"
                value={form.authorName}
                onChange={(e) => update("authorName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arole">Role</Label>
              <Input
                id="arole"
                value={form.authorRole}
                onChange={(e) => update("authorRole", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aav">Avatar URL (optional)</Label>
            <Input
              id="aav"
              placeholder="auto-generated if blank"
              value={form.authorAvatar}
              onChange={(e) => update("authorAvatar", e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/posts">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving…" : editingId ? "Update Post" : form.published ? "Publish Post" : "Save Draft"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
