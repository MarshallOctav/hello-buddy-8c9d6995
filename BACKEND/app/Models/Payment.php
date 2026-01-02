<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'plan',
        'amount',
        'payment_type',
        'status',
        'transaction_id',
        'paid_at',
        'expires_at',
        'midtrans_response',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
        'midtrans_response' => 'array',
    ];

    /**
     * Get the user that owns the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if payment is successful
     */
    public function isSuccessful(): bool
    {
        return in_array($this->status, ['settlement', 'capture']);
    }

    /**
     * Get human-readable status
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Menunggu Pembayaran',
            'settlement', 'capture' => 'Berhasil',
            'cancel' => 'Dibatalkan',
            'deny' => 'Ditolak',
            'expire' => 'Kadaluarsa',
            'refund' => 'Refund',
            default => ucfirst($this->status),
        };
    }

    /**
     * Get plan name
     */
    public function getPlanNameAttribute(): string
    {
        return match($this->plan) {
            'PRO' => 'Diagnospace Pro',
            'PREMIUM' => 'Diagnospace Premium',
            default => $this->plan,
        };
    }
}
