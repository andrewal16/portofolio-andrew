<?php

namespace App\Observers;

use App\Models\Experience;
use Illuminate\Support\Facades\Cache;

class ExperienceObserver
{
    public function created(Experience $experience): void
    {
        $this->clearExperienceCache($experience);
    }

    public function updated(Experience $experience): void
    {
        $this->clearExperienceCache($experience);
    }

    public function deleted(Experience $experience): void
    {
        $this->clearExperienceCache($experience);
    }

    private function clearExperienceCache(Experience $experience): void
    {
        Cache::forget('portfolio:experiences');
        Cache::forget("portfolio:experience:{$experience->slug}");
    }
}
