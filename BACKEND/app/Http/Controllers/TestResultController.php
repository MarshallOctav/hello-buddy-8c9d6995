<?php

namespace App\Http\Controllers;

use App\Models\TestResult;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TestResultController extends Controller
{
    /**
     * Store a new test result.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'test_id' => 'required|string|max:255',
            'test_title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'score' => 'required|integer|min:0|max:100',
            'level' => 'required|string|in:Low,Medium,High,Expert',
            'answers' => 'nullable|array',
            'dimension_scores' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        
        // Calculate XP earned
        $xpEarned = TestResult::calculateXP($request->score, $request->level);
        
        $testResult = TestResult::create([
            'user_id' => $user->id,
            'test_id' => $request->test_id,
            'test_title' => $request->test_title,
            'category' => $request->category,
            'score' => $request->score,
            'level' => $request->level,
            'xp_earned' => $xpEarned,
            'answers' => $request->answers,
            'dimension_scores' => $request->dimension_scores,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Test result saved successfully',
            'data' => $testResult,
            'xp_earned' => $xpEarned
        ], 201);
    }

    /**
     * Get user's test history.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $history = TestResult::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($result) {
                return [
                    'id' => $result->id,
                    'test_id' => $result->test_id,
                    'test_title' => $result->test_title,
                    'category' => $result->category,
                    'score' => $result->score,
                    'level' => $result->level,
                    'xp_earned' => $result->xp_earned,
                    'dimension_scores' => $result->dimension_scores,
                    'date' => $result->created_at->format('d/m/Y'),
                    'created_at' => $result->created_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    /**
     * Get user statistics.
     */
    public function getStats()
    {
        $user = Auth::user();
        
        $results = TestResult::where('user_id', $user->id)->get();
        
        $completedTests = $results->count();
        $totalXP = $results->sum('xp_earned');
        $avgScore = $completedTests > 0 ? round($results->avg('score')) : 0;
        
        // Calculate streak (consecutive days with test results)
        $currentStreak = $this->calculateStreak($user->id);
        
        // Get activity data for the last 7 days
        $activityData = $this->getActivityData($user->id);
        
        return response()->json([
            'success' => true,
            'data' => [
                'completed_tests' => $completedTests,
                'total_xp' => $totalXP,
                'avg_score' => $avgScore,
                'current_streak' => $currentStreak,
                'activity_data' => $activityData,
            ]
        ]);
    }

    /**
     * Get leaderboard.
     */
    public function getLeaderboard()
    {
        $currentUser = Auth::user();
        
        // Get top users by total XP (exclude admin users)
        $leaderboard = User::select('users.id', 'users.name', 'users.avatar_url')
            ->where(function($q) {
                $q->where('users.role', '!=', 'admin')
                  ->orWhereNull('users.role');
            })
            ->leftJoin('test_results', 'users.id', '=', 'test_results.user_id')
            ->groupBy('users.id', 'users.name', 'users.avatar_url')
            ->selectRaw('COALESCE(SUM(test_results.xp_earned), 0) as total_xp')
            ->selectRaw('COUNT(test_results.id) as test_count')
            ->orderByDesc('total_xp')
            ->limit(10)
            ->get()
            ->map(function ($user, $index) use ($currentUser) {
                // Generate avatar color based on user id
                $colors = [
                    'bg-pink-100 text-pink-600',
                    'bg-blue-100 text-blue-600',
                    'bg-purple-100 text-purple-600',
                    'bg-yellow-100 text-yellow-600',
                    'bg-green-100 text-green-600',
                    'bg-orange-100 text-orange-600',
                    'bg-teal-100 text-teal-600',
                    'bg-red-100 text-red-600',
                ];
                
                // Get actual badges from user_badges table
                $userBadges = UserBadge::where('user_id', $user->id)
                    ->get()
                    ->map(function ($badge) {
                        return [
                            'id' => $badge->badge_id,
                            'name' => $badge->name,
                            'icon' => $badge->icon,
                            'color' => $badge->color,
                        ];
                    });
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'points' => (int) $user->total_xp,
                    'badges' => count($userBadges),
                    'badge_list' => $userBadges,
                    'avatar' => $colors[$user->id % count($colors)],
                    'avatar_url' => $user->avatar_url,
                    'is_me' => $user->id === $currentUser->id,
                    'trend' => '+' . rand(0, 20) . '%', // Placeholder trend
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $leaderboard
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
        
        // Check if the first date is today or yesterday
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

    /**
     * Get activity data for the last 7 days.
     */
    private function getActivityData(int $userId): array
    {
        $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $activityData = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayName = $days[$date->dayOfWeek === 0 ? 6 : $date->dayOfWeek - 1];
            
            $xp = TestResult::where('user_id', $userId)
                ->whereDate('created_at', $date->format('Y-m-d'))
                ->sum('xp_earned');

            $activityData[] = [
                'name' => $dayName,
                'xp' => (int) $xp,
            ];
        }

        return $activityData;
    }
}
