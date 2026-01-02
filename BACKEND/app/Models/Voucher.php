<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_percent',
        'limit_user',
        'used_count',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'discount_percent' => 'integer',
        'limit_user' => 'integer',
        'used_count' => 'integer',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    /**
     * Get payments that used this voucher
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Check if voucher is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at < now();
    }

    /**
     * Check if voucher has reached usage limit
     */
    public function isLimitReached(): bool
    {
        return $this->used_count >= $this->limit_user;
    }

    /**
     * Check if voucher is valid for use
     */
    public function isValid(): bool
    {
        return $this->is_active && !$this->isExpired() && !$this->isLimitReached();
    }

    /**
     * Increment usage count and auto-deactivate if limit reached
     */
    public function incrementUsage(): void
    {
        $this->used_count++;
        
        // Auto-deactivate if limit reached
        if ($this->used_count >= $this->limit_user) {
            $this->is_active = false;
        }
        
        $this->save();
    }

    /**
     * Get computed status attribute
     */
    public function getStatusAttribute(): string
    {
        if ($this->isExpired()) {
            return 'expired';
        }
        
        if ($this->isLimitReached()) {
            return 'limit_reached';
        }
        
        return $this->is_active ? 'active' : 'inactive';
    }

    /**
     * Get human-readable status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'active' => 'Aktif',
            'inactive' => 'Nonaktif',
            'expired' => 'Kadaluarsa',
            'limit_reached' => 'Limit Habis',
            default => ucfirst($this->status),
        };
    }

    /**
     * Scope to get only valid vouchers
     */
    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where('expires_at', '>', now())
            ->whereColumn('used_count', '<', 'limit_user');
    }
}
