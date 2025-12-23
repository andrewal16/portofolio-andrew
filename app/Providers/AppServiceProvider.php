<?php

namespace App\Providers;

use App\Models\Certificate;
use App\Observers\CertificateObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        Certificate::observe(CertificateObserver::class);
        if($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
