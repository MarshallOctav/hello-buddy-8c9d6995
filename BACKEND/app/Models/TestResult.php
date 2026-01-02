<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestResult extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'test_id',
        'test_title',
        'category',
        'score',
        'level',
        'xp_earned',
        'answers',
        'dimension_scores',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'answers' => 'array',
        'dimension_scores' => 'array',
        'score' => 'integer',
        'xp_earned' => 'integer',
    ];

    /**
     * Get the user that owns the test result.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate XP earned based on score and level.
     */
    public static function calculateXP(int $score, string $level): int
    {
        $baseXP = $score;
        
        $multiplier = match($level) {
            'Expert' => 2.0,
            'High' => 1.5,
            'Medium' => 1.0,
            'Low' => 0.5,
            default => 1.0,
        };
        
        return (int) round($baseXP * $multiplier);
    }

    /**
     * Determine level based on score.
     */
    public static function determineLevel(int $score): string
    {
        return match(true) {
            $score >= 90 => 'Expert',
            $score >= 70 => 'High',
            $score >= 50 => 'Medium',
            default => 'Low',
        };
    }
}
