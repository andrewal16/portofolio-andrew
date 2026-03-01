<?php

namespace App\Observers;

use App\Models\Project;
use Illuminate\Support\Facades\Cache;

class ProjectObserver
{
    public function created(Project $project): void
    {
        $this->clearProjectCache($project);
    }

    public function updated(Project $project): void
    {
        $this->clearProjectCache($project);
    }

    public function deleted(Project $project): void
    {
        $this->clearProjectCache($project);
    }

    private function clearProjectCache(Project $project): void
    {
        Cache::forget('portfolio:projects:initial');
        Cache::forget('portfolio:project_types');
        Cache::forget("portfolio:project:{$project->slug}");

        $types = ['all', 'Web App', 'Data Science', 'AI', 'Mobile'];
        foreach ($types as $type) {
            for ($page = 1; $page <= 5; $page++) {
                foreach ([6, 9, 12] as $perPage) {
                    Cache::forget("portfolio:projects:type_{$type}:page_{$page}:per_{$perPage}");
                }
            }
        }
    }
}
