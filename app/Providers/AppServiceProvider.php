<?php

namespace App\Providers;

use App\Models\BlogPost;
use App\Models\Certificate;
use App\Models\Experience;
use App\Models\Project;
use App\Observers\BlogPostObserver;
use App\Observers\CertificateObserver;
use App\Observers\ExperienceObserver;
use App\Observers\ProjectObserver;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Project::observe(ProjectObserver::class);
        Certificate::observe(CertificateObserver::class);
        Experience::observe(ExperienceObserver::class);
        BlogPost::observe(BlogPostObserver::class);

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
