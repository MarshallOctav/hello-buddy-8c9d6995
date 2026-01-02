<?php

namespace App\Http\Controllers;

use App\Models\UserBadge;
use App\Models\TestResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BadgeController extends Controller
{
    /**
     * Get user's badges.
     */
    public function index()
    {
        $user = Auth::user();
        
        $badges = UserBadge::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($badge) {
                $definitions = UserBadge::getBadgeDefinitions();
                $def = $definitions[$badge->badge_id] ?? null;
                
                return [
                    'id' => $badge->badge_id,
                    'name' => $badge->name,
                    'icon' => $badge->icon ?? ($def['icon'] ?? 'award'),
                    'color' => $badge->color ?? ($def['color'] ?? 'bg-gray-100 text-gray-600'),
                    'earned_at' => $badge->created_at->toISOString(),
                ];
            });

        // Get all badge definitions for progress tracking
        $allBadges = UserBadge::getBadgeDefinitions();
        $earnedBadgeIds = $badges->pluck('id')->toArray();
        
        $lockedBadges = collect($allBadges)
            ->filter(function ($badge) use ($earnedBadgeIds) {
                return !in_array($badge['id'], $earnedBadgeIds);
            })
            ->map(function ($badge) {
                return [
                    'id' => $badge['id'],
                    'name' => $badge['name_en'],
                    'icon' => $badge['icon'],
                    'color' => 'bg-slate-100 text-slate-300',
                    'locked' => true,
                    'criteria' => $badge['criteria'],
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'earned' => $badges,
                'locked' => $lockedBadges,
                'total_badges' => count($allBadges),
                'earned_count' => count($badges),
            ]
        ]);
    }

    /**
     * Check and award badges based on user's progress.
     * Called after completing a test.
     */
    public function checkAndAwardBadges()
    {
        $user = Auth::user();
        $newBadges = [];
        
        // Get user's test statistics
        $results = TestResult::where('user_id', $user->id)->get();
        $completedTests = $results->count();
        $totalXP = $results->sum('xp_earned');
        $avgScore = $completedTests > 0 ? round($results->avg('score')) : 0;
        $maxScore = $results->max('score') ?? 0;
        $currentStreak = $this->calculateStreak($user->id);
        $uniqueCategories = $results->pluck('category')->unique()->count();
        
        // Check each badge criteria
        $badgesToCheck = [
            // First Responder - Complete first test
            [
                'badge_id' => 'first_responder',
                'condition' => $completedTests >= 1,
            ],
            // Momentum Builder - 3-day streak
            [
                'badge_id' => 'momentum_builder',
                'condition' => $currentStreak >= 3,
            ],
            // Consistent - Complete 5 tests
            [
                'badge_id' => 'consistent',
                'condition' => $completedTests >= 5,
            ],
            // High Achiever - Score 90%+
            [
                'badge_id' => 'high_achiever',
                'condition' => $maxScore >= 90,
            ],
            // Dedicated - Complete 10 tests
            [
                'badge_id' => 'dedicated',
                'condition' => $completedTests >= 10,
            ],
            // Week Warrior - 7-day streak
            [
                'badge_id' => 'week_warrior',
                'condition' => $currentStreak >= 7,
            ],
            // XP Collector - Earn 1000 XP
            [
                'badge_id' => 'xp_collector',
                'condition' => $totalXP >= 1000,
            ],
            // Perfectionist - Score 100%
            [
                'badge_id' => 'perfectionist',
                'condition' => $maxScore >= 100,
            ],
            // Explorer - 3 different categories
            [
                'badge_id' => 'explorer',
                'condition' => $uniqueCategories >= 3,
            ],
            // Master - Average score above 85%
            [
                'badge_id' => 'master',
                'condition' => $avgScore >= 85 && $completedTests >= 5,
            ],
            // Veteran - Complete 25 tests
            [
                'badge_id' => 'veteran',
                'condition' => $completedTests >= 25,
            ],
            // Legend - 50 tests with 80%+ average
            [
                'badge_id' => 'legend',
                'condition' => $completedTests >= 50 && $avgScore >= 80,
            ],
        ];

        $definitions = UserBadge::getBadgeDefinitions();

        foreach ($badgesToCheck as $check) {
            if ($check['condition']) {
                // Check if user already has this badge
                $exists = UserBadge::where('user_id', $user->id)
                    ->where('badge_id', $check['badge_id'])
                    ->exists();

                if (!$exists && isset($definitions[$check['badge_id']])) {
                    $def = $definitions[$check['badge_id']];
                    
                    $badge = UserBadge::create([
                        'user_id' => $user->id,
                        'badge_id' => $check['badge_id'],
                        'name' => $def['name_en'],
                        'icon' => $def['icon'],
                        'color' => $def['color'],
                    ]);

                    $newBadges[] = [
                        'id' => $badge->badge_id,
                        'name' => $badge->name,
                        'icon' => $badge->icon,
                        'color' => $badge->color,
                    ];
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'new_badges' => $newBadges,
                'total_earned' => UserBadge::where('user_id', $user->id)->count(),
            ]
        ]);
    }

    /**
     * Calculate user's current streak.
     */
    private function calculateStreak(int $userId): int
    {
        $dates = TestResult::where('user_id', $userId)
            ->select(DB::raw('DATE(created_at) as date'))
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->toArray();

        if (empty($dates)) {
            return 0;
        }

        $streak = 0;
        $today = now()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');
        
        if ($dates[0] !== $today && $dates[0] !== $yesterday) {
            return 0;
        }

        $currentDate = $dates[0];
        $streak = 1;

        for ($i = 1; $i < count($dates); $i++) {
            $expectedDate = date('Y-m-d', strtotime($currentDate . ' -1 day'));
            
            if ($dates[$i] === $expectedDate) {
                $streak++;
                $currentDate = $dates[$i];
            } else {
                break;
            }
        }

        return $streak;
    }
}
