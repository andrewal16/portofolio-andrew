<?php

namespace App\Observers;

use App\Models\Certificate;
use Illuminate\Support\Facades\Cache;

class CertificateObserver
{
    /**
     * Handle the Certificate "created" event.
     */
    public function created(Certificate $certificate): void
    {
        $this->clearCertificatesCache();
    }

    /**
     * Handle the Certificate "updated" event.
     */
    public function updated(Certificate $certificate): void
    {
        $this->clearCertificatesCache();
    }

    /**
     * Handle the Certificate "deleted" event.
     */
    public function deleted(Certificate $certificate): void
    {
        $this->clearCertificatesCache();
    }

    /**
     * Clear certificates cache
     */
    private function clearCertificatesCache(): void
    {
        Cache::forget('certificates:all');
    }
}
