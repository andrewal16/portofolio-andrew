<?php

namespace App\Observers;

use App\Models\Certificate;
use Illuminate\Support\Facades\Cache;

class CertificateObserver
{
    public function created(Certificate $certificate): void
    {
        $this->clearCertificatesCache();
    }

    public function updated(Certificate $certificate): void
    {
        $this->clearCertificatesCache();
    }

    public function deleted(Certificate $certificate): void
    {
        $this->clearCertificatesCache();
    }

    private function clearCertificatesCache(): void
    {
        Cache::forget('portfolio:certificates:initial');

        $categories = ['all', 'learning', 'competition'];
        foreach ($categories as $category) {
            for ($page = 1; $page <= 5; $page++) {
                foreach ([6, 9, 12] as $perPage) {
                    Cache::forget("portfolio:certs:cat_{$category}:page_{$page}:per_{$perPage}");
                }
            }
        }
    }
}
