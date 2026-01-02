<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'is_admin',
        'type',
        'title',
        'message',
        'data',
        'is_read',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'is_read' => 'boolean',
        'data' => 'array',
    ];

    const TYPE_WITHDRAWAL_APPROVED = 'withdrawal_approved';
    const TYPE_WITHDRAWAL_REJECTED = 'withdrawal_rejected';
    const TYPE_REFERRAL_COMMISSION = 'referral_commission';
    const TYPE_NEW_USER = 'new_user';
    const TYPE_NEW_WITHDRAWAL = 'new_withdrawal';

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create notification for user
     */
    public static function createForUser(int $userId, string $type, string $title, string $message, ?array $data = null): self
    {
        return self::create([
            'user_id' => $userId,
            'is_admin' => false,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Create notification for admin
     */
    public static function createForAdmin(string $type, string $title, string $message, ?array $data = null): self
    {
        return self::create([
            'user_id' => null,
            'is_admin' => true,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Scopes
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId)->where('is_admin', false);
    }

    public function scopeForAdmin($query)
    {
        return $query->where('is_admin', true);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
