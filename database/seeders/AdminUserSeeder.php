<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ✅ Buat admin pertama
        User::firstOrCreate(
            ['email' => 'admin@example.com'], // Cek berdasarkan email
            [
                'name' => 'Admin Portfolio',
                'password' => Hash::make('password'), // ⚠️ GANTI DI PRODUCTION!
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Admin user created successfully!');
        $this->command->info('📧 Email: admin@example.com');
        $this->command->info('🔑 Password: password');
    }
}
