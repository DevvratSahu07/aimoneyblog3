import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Box,
  Mail,
  LogOut,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminFetch, getAdminToken, setAdminToken } from "@/lib/admin";

interface Props {
  children: ReactNode;
  title?: string;
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: Folder },
  { href: "/admin/resources", label: "Resources", icon: Box },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
];

export function AdminLayout({ children, title }: Props) {
  const [location, setLocation] = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) {
      setLocation("/admin/login");
      return;
    }
    adminFetch("/admin/check")
      .then(() => setReady(true))
      .catch(() => {
        setAdminToken(null);
        setLocation("/admin/login");
      });
  }, [setLocation]);

  function logout() {
    setAdminToken(null);
    setLocation("/admin/login");
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading admin…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-60 shrink-0 border-r bg-background flex flex-col">
        <Link href="/admin">
          <div className="px-5 py-5 flex items-center gap-2 border-b cursor-pointer">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-serif font-bold leading-tight">AI Money</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = item.exact
              ? location === item.href
              : location === item.href || location.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" /> View site
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            size="sm"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto">
        <div className="px-8 py-8 max-w-6xl mx-auto">
          {title && (
            <h1 className="text-3xl font-serif font-bold mb-6">{title}</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
