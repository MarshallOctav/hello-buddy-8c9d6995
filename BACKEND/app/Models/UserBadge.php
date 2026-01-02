<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserBadge extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'badge_id',
        'name',
        'icon',
        'color',
    ];

    /**
     * Get the user that owns the badge.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Badge definitions with unlock criteria
     */
    public static function getBadgeDefinitions(): array
    {
        return [
            'first_responder' => [
                'id' => 'first_responder',
                'name_en' => 'First Responder',
                'name_id' => 'First Responder',
                'icon' => 'zap',
                'color' => 'bg-yellow-100 text-yellow-600 ring-yellow-500/20',
                'criteria' => 'Complete your first test',
            ],
            'momentum_builder' => [
                'id' => 'momentum_builder',
                'name_en' => 'Momentum Builder',
                'name_id' => 'Pembangun Momentum',
                'icon' => 'trending-up',
                'color' => 'bg-green-100 text-green-600 ring-green-500/20',
                'criteria' => 'Maintain 3-day streak',
            ],
            'consistent' => [
                'id' => 'consistent',
                'name_en' => 'Consistent',
                'name_id' => 'Konsisten',
                'icon' => 'award',
                'color' => 'bg-blue-100 text-blue-600 ring-blue-500/20',
                'criteria' => 'Complete 5 tests',
            ],
            'high_achiever' => [
                'id' => 'high_achiever',
                'name_en' => 'High Achiever',
                'name_id' => 'Berprestasi Tinggi',
                'icon' => 'star',
                'color' => 'bg-purple-100 text-purple-600 ring-purple-500/20',
                'criteria' => 'Score 90%+ on any test',
            ],
            'dedicated' => [
                'id' => 'dedicated',
                'name_en' => 'Dedicated',
                'name_id' => 'Berdedikasi',
                'icon' => 'target',
                'color' => 'bg-orange-100 text-orange-600 ring-orange-500/20',
                'criteria' => 'Complete 10 tests',
            ],
            'week_warrior' => [
                'id' => 'week_warrior',
                'name_en' => 'Week Warrior',
                'name_id' => 'Pejuang Mingguan',
                'icon' => 'flame',
                'color' => 'bg-red-100 text-red-600 ring-red-500/20',
                'criteria' => 'Maintain 7-day streak',
            ],
            'xp_collector' => [
                'id' => 'xp_collector',
                'name_en' => 'XP Collector',
                'name_id' => 'Pengumpul XP',
                'icon' => 'coins',
                'color' => 'bg-amber-100 text-amber-600 ring-amber-500/20',
                'criteria' => 'Earn 1000 XP',
            ],
            'perfectionist' => [
                'id' => 'perfectionist',
                'name_en' => 'Perfectionist',
                'name_id' => 'Perfeksionis',
                'icon' => 'check-circle',
                'color' => 'bg-emerald-100 text-emerald-600 ring-emerald-500/20',
                'criteria' => 'Score 100% on any test',
            ],
            'explorer' => [
                'id' => 'explorer',
                'name_en' => 'Explorer',
                'name_id' => 'Penjelajah',
                'icon' => 'compass',
                'color' => 'bg-cyan-100 text-cyan-600 ring-cyan-500/20',
                'criteria' => 'Complete tests in 3 different categories',
            ],
            'master' => [
                'id' => 'master',
                'name_en' => 'Master',
                'name_id' => 'Master',
                'icon' => 'crown',
                'color' => 'bg-indigo-100 text-indigo-600 ring-indigo-500/20',
                'criteria' => 'Average score above 85%',
            ],
            'veteran' => [
                'id' => 'veteran',
                'name_en' => 'Veteran',
                'name_id' => 'Veteran',
                'icon' => 'medal',
                'color' => 'bg-slate-100 text-slate-600 ring-slate-500/20',
                'criteria' => 'Complete 25 tests',
            ],
            'legend' => [
                'id' => 'legend',
                'name_en' => 'Legend',
                'name_id' => 'Legenda',
                'icon' => 'trophy',
                'color' => 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-600 ring-amber-500/20',
                'criteria' => 'Complete 50 tests with 80%+ average',
            ],
        ];
    }
}
