<?php

namespace App\Observers;

use App\Models\BlogPost;
use Illuminate\Support\Facades\Cache;

class BlogPostObserver
{
    public function created(BlogPost $blog): void
    {
        $this->clearBlogCache($blog);
    }

    public function updated(BlogPost $blog): void
    {
        $this->clearBlogCache($blog);
    }

    public function deleted(BlogPost $blog): void
    {
        $this->clearBlogCache($blog);
    }

    private function clearBlogCache(BlogPost $blog): void
    {
        Cache::forget('portfolio:blogs:recent');
        Cache::forget("portfolio:blog:{$blog->slug}");
    }
}
