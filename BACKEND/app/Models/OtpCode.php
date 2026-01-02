<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class OtpCode extends Model
{
    protected $fillable = [
        'email',
        'otp',
        'type',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Generate a new OTP code
     */
    public static function generateOtp(string $email, string $type = 'register'): self
    {
        // Invalidate previous OTPs
        self::where('email', $email)
            ->where('type', $type)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        // Generate new 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        return self::create([
            'email' => $email,
            'otp' => $otp,
            'type' => $type,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);
    }

    /**
     * Verify OTP code
     */
    public static function verifyOtp(string $email, string $otp, string $type = 'register'): bool
    {
        $otpRecord = self::where('email', $email)
            ->where('otp', $otp)
            ->where('type', $type)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($otpRecord) {
            $otpRecord->update(['is_used' => true]);
            return true;
        }

        return false;
    }
}
