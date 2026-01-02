<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'slug' => 'PRO',
                'name' => 'Pro',
                'price' => 299000,
                'duration_months' => 1,
                'features' => [
                    'Akses Semua Tes',
                    'Laporan PDF',
                    'Pelacakan Progres',
                    'Analisis Mendalam',
                ],
            ],
            [
                'slug' => 'PREMIUM',
                'name' => 'Premium',
                'price' => 1499000,
                'duration_months' => 12,
                'features' => [
                    'Semua Fitur Pro',
                    'Dukungan Prioritas',
                    'Panggilan Konsultasi',
                    'Bonus Afiliasi',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
