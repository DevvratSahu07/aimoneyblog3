import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import Blog from "@/pages/blog";
import PostDetail from "@/pages/post";
import Categories from "@/pages/categories";
import CategoryDetail from "@/pages/category";
import Resources from "@/pages/resources";
import Trending from "@/pages/trending";
import Assistant from "@/pages/assistant";
import About from "@/pages/about";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin";
import AdminEditor from "@/pages/admin-editor";
import AdminPosts from "@/pages/admin-posts";
import AdminCategories from "@/pages/admin-categories";
import AdminResources from "@/pages/admin-resources";
import AdminSubscribers from "@/pages/admin-subscribers";

const queryClient = new QueryClient();

function PublicRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={PostDetail} />
        <Route path="/categories" component={Categories} />
        <Route path="/categories/:slug" component={CategoryDetail} />
        <Route path="/resources" component={Resources} />
        <Route path="/trending" component={Trending} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/new" component={AdminEditor} />
      <Route path="/admin/edit/:id" component={AdminEditor} />
      <Route path="/admin/posts" component={AdminPosts} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/resources" component={AdminResources} />
      <Route path="/admin/subscribers" component={AdminSubscribers} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={PublicRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ai-money-blog-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
