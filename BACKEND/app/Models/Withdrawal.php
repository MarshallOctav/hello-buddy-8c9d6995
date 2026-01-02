<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    protected $fillable = [
        'affiliate_id',
        'amount',
        'payment_method',
        'bank_name',
        'account_name',
        'account_number',
        'status',
        'admin_notes',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    const PAYMENT_METHODS = [
        'bank_transfer' => 'Bank Transfer',
        'dana' => 'Dana',
        'gopay' => 'GoPay',
        'ovo' => 'OVO',
        'shopeepay' => 'ShopeePay',
    ];

    /**
     * Relationships
     */
    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(UserAffiliate::class, 'affiliate_id');
    }

    /**
     * Check if withdrawal can be processed
     */
    public function canProcess(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Approve withdrawal
     */
    public function approve(?string $notes = null): void
    {
        $this->update([
            'status' => 'approved',
            'admin_notes' => $notes,
            'processed_at' => now(),
        ]);
    }

    /**
     * Reject withdrawal and restore balance
     */
    public function reject(string $reason): void
    {
        $this->update([
            'status' => 'rejected',
            'admin_notes' => $reason,
            'processed_at' => now(),
        ]);

        // Restore balance to affiliate
        $this->affiliate->restoreBalance($this->amount);
    }
}
