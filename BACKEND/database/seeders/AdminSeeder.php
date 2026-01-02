<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@diagnospace.com'],
            [
                'name' => 'Admin Diagnospace',
                'email' => 'admin@diagnospace.com',
                'password' => Hash::make('diagnospace2025!'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
    }
}
