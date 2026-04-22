import { useListFeaturedPosts, useListTrendingPosts, useListCategories, useListPopularTags, useListResources, useGetStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { CategoryCard } from "@/components/CategoryCard";
import { ResourceCard } from "@/components/ResourceCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ArrowRight, TrendingUp, Sparkles, Box, LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredPosts, isLoading: loadingFeatured } = useListFeaturedPosts();
  const { data: trendingPosts, isLoading: loadingTrending } = useListTrendingPosts({ limit: 4 });
  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { data: popularTags, isLoading: loadingTags } = useListPopularTags({ limit: 8 });
  const { data: resources, isLoading: loadingResources } = useListResources({ limit: 4 });
  const { data: stats } = useGetStats();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden border-b bg-muted/30">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Turn the AI Revolution into Reality</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-foreground leading-tight">
              The modern playbook for <span className="text-primary italic">AI monetization</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Discover actionable strategies, learn from successful founders, and build your own AI-powered side hustle. No fluff, just what works.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/blog">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                  Start Reading
                </Button>
              </Link>
              <Link href="/assistant">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
                  Ask AI Assistant
                </Button>
              </Link>
            </div>
            {stats && (
              <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground border-t border-border/50 mt-12 w-max mx-auto px-8">
                <div className="text-center"><span className="block font-bold text-foreground text-lg">{stats.totalReads.toLocaleString()}</span> Reads</div>
                <div className="text-center"><span className="block font-bold text-foreground text-lg">{stats.totalPosts.toLocaleString()}</span> Articles</div>
                <div className="text-center"><span className="block font-bold text-foreground text-lg">{stats.totalSubscribers.toLocaleString()}</span> Readers</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 md:py-24 container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Editor's Picks
          </h2>
          <Link href="/blog" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="aspect-video w-full rounded-xl" />
          </div>
        ) : featuredPosts && featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <PostCard post={featuredPosts[0]} layout="hero" />
            </div>
            {featuredPosts.slice(1, 3).map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        ) : null}
      </section>

      {/* Two Column Layout: Trending & Categories */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            
            {/* Trending Feed */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" /> Trending Now
                </h2>
                <Link href="/trending" className="text-sm font-medium hover:text-primary transition-colors">
                  More
                </Link>
              </div>

              <div className="flex flex-col gap-6">
                {loadingTrending ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-1/3 aspect-video rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))
                ) : (
                  trendingPosts?.map((post, i) => (
                    <PostCard key={post.id} post={post} layout="list" index={i} />
                  ))
                )}
              </div>
            </div>

            {/* Sidebar: Categories & Tags */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-serif font-bold tracking-tight">Topics</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {loadingCategories ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
                  ) : (
                    categories?.slice(0, 5).map((category) => (
                      <Link 
                        key={category.id} 
                        href={`/categories/${category.slug}`}
                        className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="font-medium group-hover:text-primary transition-colors">{category.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full shadow-sm">
                          {category.postCount}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
                <Link href="/categories" className="text-sm font-medium text-primary hover:underline block text-center">
                  View all categories
                </Link>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-serif font-bold tracking-tight border-b pb-4">Popular Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {loadingTags ? (
                    Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)
                  ) : (
                    popularTags?.map((tag) => (
                      <Link 
                        key={tag.tag} 
                        href={`/blog?tag=${tag.tag}`}
                        className="text-sm px-3 py-1.5 bg-background border rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      >
                        #{tag.tag}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Resources Highlight */}
      <section className="py-16 md:py-24 container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2 mb-2">
              <Box className="w-6 h-6 text-primary" /> Premium Resources
            </h2>
            <p className="text-muted-foreground">Tools and assets to accelerate your journey.</p>
          </div>
          <Link href="/resources" className="hidden md:flex text-primary font-medium items-center gap-1 hover:gap-2 transition-all">
            View Directory <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingResources ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources?.items?.map((resource, i) => (
              <ResourceCard key={resource.id} resource={resource} index={i} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center md:hidden">
          <Link href="/resources">
            <Button variant="outline" className="w-full">View All Resources</Button>
          </Link>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-primary text-primary-foreground mt-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-6">
            Get the unfair advantage.
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10">
            Join thousands of creators getting weekly deep-dives on the most profitable AI side hustles.
          </p>
          <div className="bg-background text-foreground p-2 rounded-2xl sm:rounded-full max-w-md mx-auto shadow-2xl">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}