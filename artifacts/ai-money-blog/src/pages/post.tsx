import { useParams, Link } from "wouter";
import { 
  useGetPost, 
  getGetPostQueryKey, 
  useGetPostSummary, 
  getGetPostSummaryQueryKey,
  useTrackPostView,
  useLikePost,
  useListRelatedPosts,
  getListRelatedPostsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/PostCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { useToast } from "@/hooks/use-toast";
import { Clock, Eye, Heart, Share2, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [hasLiked, setHasLiked] = useState(false);

  const { data: post, isLoading, error } = useGetPost(slug || "", {
    query: {
      enabled: !!slug,
      queryKey: getGetPostQueryKey(slug || "")
    }
  });

  const { data: aiSummary, isLoading: loadingSummary } = useGetPostSummary(slug || "", {
    query: {
      enabled: !!slug,
      queryKey: getGetPostSummaryQueryKey(slug || "")
    }
  });

  const { data: relatedPosts, isLoading: loadingRelated } = useListRelatedPosts(slug || "", {
    query: {
      enabled: !!slug,
      queryKey: getListRelatedPostsQueryKey(slug || "")
    }
  });

  const { mutate: trackView } = useTrackPostView();
  const { mutate: likePost, isPending: isLiking } = useLikePost();

  useEffect(() => {
    if (slug) {
      trackView({ slug });
    }
  }, [slug, trackView]);

  const handleLike = () => {
    if (!slug || hasLiked || isLiking) return;
    
    likePost(
      { slug },
      {
        onSuccess: (data) => {
          setHasLiked(true);
          queryClient.setQueryData(getGetPostQueryKey(slug), (old: any) => 
            old ? { ...old, likes: data.count } : old
          );
          toast({
            title: "Thanks for the love!",
            description: "You liked this article.",
          });
        }
      }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-4 items-center">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">We couldn't find the article you're looking for. It may have been removed or the link might be broken.</p>
        <Link href="/blog">
          <Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-20"
    >
      {/* Hero Section */}
      <header className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-4xl">
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href={`/categories/${post.category.slug}`}>
            <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-sm py-1 border-none" style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}>
              {post.category.name}
            </Badge>
          </Link>
          <Badge variant="outline" className="text-sm py-1 border-primary/20 text-primary bg-primary/5">
            {post.difficulty}
          </Badge>
          <Badge variant="outline" className="text-sm py-1">
            {post.incomeType}
          </Badge>
          {post.premium && (
            <Badge className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 text-sm py-1 border-none flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Premium
            </Badge>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground leading-tight mb-8">
          {post.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-lg">{post.author.name}</div>
              <div className="text-sm text-muted-foreground">{post.author.role}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
              <span className="mx-1">•</span>
              <span>{post.readMinutes} min read</span>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl mb-12 md:mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl relative"
        >
          <img src={post.coverImage} alt={post.title} className="object-cover w-full h-full" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1 lg:max-w-3xl lg:mx-auto">
          {/* AI Summary */}
          {loadingSummary ? (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-10">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : aiSummary ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-xl mb-3 flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" /> AI TL;DR
              </h3>
              <p className="text-foreground leading-relaxed mb-6 relative z-10">{aiSummary.tldr}</p>
              
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Key Takeaways</h4>
                <ul className="space-y-2">
                  {aiSummary.keyTakeaways.map((point, i) => (
                    <li key={i} className="flex gap-3 relative z-10">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-foreground/90">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : null}

          {/* Markdown Content */}
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none 
            prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight 
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-lg
            prose-strong:text-foreground
            mb-16"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-12">
            {post.tags.map(tag => (
              <Link key={tag} href={`/blog?tag=${tag}`}>
                <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer px-3 py-1 text-sm font-normal">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Actions & Share */}
          <div className="flex items-center justify-between py-8 border-y mb-12">
            <div className="flex gap-4">
              <Button 
                variant={hasLiked ? "default" : "outline"} 
                size="lg" 
                className="gap-2 rounded-full"
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
                <span className="font-semibold">{post.likes.toLocaleString()}</span>
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground px-4 py-2 border rounded-full text-sm font-medium bg-muted/30">
                <Eye className="w-5 h-5" />
                {post.views.toLocaleString()}
              </div>
            </div>
            
            <Button variant="outline" size="lg" className="gap-2 rounded-full" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
              Share
            </Button>
          </div>

          {/* Author Bio */}
          <div className="bg-muted/30 rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left mb-16">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="text-2xl">{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <h3 className="font-serif text-2xl font-bold">{post.author.name}</h3>
              <p className="text-primary font-medium">{post.author.role}</p>
              <p className="text-muted-foreground">
                Passionate about helping creators monetize their skills with AI. Building tools and writing guides for the next generation of solo founders.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar / Sticky Actions */}
        <div className="hidden lg:block w-64 shrink-0 relative">
          <div className="sticky top-24 space-y-8">
            <div className="p-6 border rounded-xl bg-card shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-lg border-b pb-2">Article Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Published</span>
                  <span className="font-medium">{formatDistanceToNow(new Date(post.publishedAt))} ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Read Time</span>
                  <span className="font-medium">{post.readMinutes} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-medium capitalize">{post.difficulty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Income</span>
                  <span className="font-medium capitalize">{post.incomeType}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-xl bg-primary text-primary-foreground shadow-lg space-y-4">
              <h3 className="font-serif font-bold text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Join the Club
              </h3>
              <p className="text-primary-foreground/90 text-sm">
                Get weekly insights on the best AI monetization strategies.
              </p>
              <NewsletterForm variant="compact" />
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      <div className="bg-muted/30 border-t py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-serif font-bold tracking-tight mb-10">More to explore</h2>
          
          {loadingRelated ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-[16/10] rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : relatedPosts && relatedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, i) => (
                <PostCard key={relatedPost.id} post={relatedPost} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No related posts found.</p>
          )}
        </div>
      </div>
    </motion.article>
  );
}