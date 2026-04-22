import { PostSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Eye, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface PostCardProps {
  post: PostSummary;
  layout?: "grid" | "list" | "hero";
  index?: number;
}

export function PostCard({ post, layout = "grid", index = 0 }: PostCardProps) {
  const isHero = layout === "hero";
  const isList = layout === "list";

  const difficultyColor = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  }[post.difficulty];

  const incomeTypeColor = {
    passive: "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400",
    active: "border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400",
    hybrid: "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400",
  }[post.incomeType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`h-full ${isList ? 'w-full' : ''}`}
    >
      <Link href={`/blog/${post.slug}`} className="block h-full group">
        <Card className={`h-full overflow-hidden flex ${isList ? 'flex-col md:flex-row' : 'flex-col'} hover-elevate border-border/50 hover:border-primary/30 transition-all duration-300`}>
          <div className={`${isHero ? 'aspect-video' : isList ? 'md:w-1/3 md:shrink-0 aspect-video md:aspect-auto' : 'aspect-[16/10]'} relative overflow-hidden bg-muted`}>
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
            {post.premium && (
              <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-950 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Premium
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="secondary" className={`${difficultyColor} border-none`}>
                {post.difficulty}
              </Badge>
              <Badge variant="outline" className={`bg-background/80 backdrop-blur-sm ${incomeTypeColor}`}>
                {post.incomeType}
              </Badge>
            </div>
          </div>
          
          <div className={`flex flex-col flex-1 ${isHero ? 'p-6 md:p-8 md:w-2/3 md:absolute md:bottom-8 md:right-8 md:bg-background/95 md:backdrop-blur-md md:rounded-xl md:shadow-xl' : ''}`}>
            <CardHeader className={`p-5 pb-2 ${isHero ? 'md:p-6 md:pb-3' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary" style={{ color: post.category.color }}>
                  {post.category.name}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readMinutes} min read
                </span>
              </div>
              <h3 className={`font-serif font-bold tracking-tight ${isHero ? 'text-2xl md:text-3xl' : 'text-xl'} group-hover:text-primary transition-colors line-clamp-2`}>
                {post.title}
              </h3>
            </CardHeader>
            
            <CardContent className={`p-5 py-0 flex-1 ${isHero ? 'md:px-6 md:py-0' : ''}`}>
              <p className={`text-muted-foreground ${isHero ? 'text-base' : 'text-sm'} line-clamp-3 mb-4`}>
                {post.excerpt}
              </p>
            </CardContent>
            
            <CardFooter className={`p-5 pt-4 mt-auto border-t border-border/50 flex items-center justify-between ${isHero ? 'md:p-6 md:pt-4' : ''}`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{post.author.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="w-3.5 h-3.5" />
                {post.views.toLocaleString()}
              </div>
            </CardFooter>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}