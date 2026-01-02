<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AffiliateSetting extends Model
{
    protected $fillable = [
        'whatsapp_cs',
        'commission_percentage',
        'discount_percentage',
        'min_withdrawal',
    ];

    protected $casts = [
        'commission_percentage' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'min_withdrawal' => 'decimal:2',
    ];

    /**
     * Get settings (singleton pattern - always returns first row or creates one)
     */
    public static function getSettings(): self
    {
        $settings = self::first();
        
        if (!$settings) {
            $settings = self::create([
                'whatsapp_cs' => '6281234567890',
                'commission_percentage' => 10.00,
                'discount_percentage' => 5.00,
                'min_withdrawal' => 50000.00,
            ]);
        }

        return $settings;
    }
}
