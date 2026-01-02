<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralTransaction extends Model
{
    protected $fillable = [
        'affiliate_id',
        'referred_user_id',
        'payment_id',
        'order_amount',
        'discount_given',
        'commission_earned',
        'plan_name',
        'status',
    ];

    protected $casts = [
        'order_amount' => 'decimal:2',
        'discount_given' => 'decimal:2',
        'commission_earned' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(UserAffiliate::class, 'affiliate_id');
    }

    public function referredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
