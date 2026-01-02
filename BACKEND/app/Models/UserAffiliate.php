<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class UserAffiliate extends Model
{
    protected $fillable = [
        'user_id',
        'referral_code',
        'is_active',
        'balance',
        'total_earned',
        'total_referrals',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'balance' => 'decimal:2',
        'total_earned' => 'decimal:2',
        'total_referrals' => 'integer',
    ];

    /**
     * Generate unique referral code (max 15 chars to fit column constraint)
     */
    public static function generateUniqueCode(): string
    {
        $maxAttempts = 10;
        $attempt = 0;
        
        do {
            // Generate 6-character code to stay well within 15 char limit
            $code = strtoupper(Str::random(6));
            $attempt++;
            
            if ($attempt >= $maxAttempts) {
                // Fallback: use timestamp-based code
                $code = strtoupper(substr(md5(uniqid()), 0, 8));
            }
        } while (self::where('referral_code', $code)->exists() && $attempt < $maxAttempts + 5);

        return $code;
    }

    /**
     * Validate custom referral code format
     */
    public static function isValidCodeFormat(string $code): bool
    {
        // 4-15 characters, alphanumeric only
        return preg_match('/^[A-Za-z0-9]{4,15}$/', $code);
    }

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(ReferralTransaction::class, 'affiliate_id');
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class, 'affiliate_id');
    }

    /**
     * Add commission to balance
     */
    public function addCommission(float $amount): void
    {
        $this->increment('balance', $amount);
        $this->increment('total_earned', $amount);
        $this->increment('total_referrals');
    }

    /**
     * Deduct balance for withdrawal
     */
    public function deductBalance(float $amount): bool
    {
        if ($this->balance < $amount) {
            return false;
        }
        
        $this->decrement('balance', $amount);
        return true;
    }

    /**
     * Restore balance (for rejected withdrawal)
     */
    public function restoreBalance(float $amount): void
    {
        $this->increment('balance', $amount);
    }
}
