<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'bio',
        'avatar_url',
        'plan',
        'plan_expires_at',
    ];

    /**
     * Get the user's payments.
     */
    public function payments()
    {
        return $this->hasMany(\App\Models\Payment::class);
    }

    /**
     * Check if plan is expired and downgrade if necessary.
     */
    public function checkAndDowngradePlan(): array
    {
        $wasDowngraded = false;
        $previousPlan = $this->plan;

        if ($this->plan !== 'FREE' && $this->plan_expires_at && now()->gt($this->plan_expires_at)) {
            $this->plan = 'FREE';
            $this->plan_expires_at = null;
            $this->save();
            $wasDowngraded = true;
        }

        return [
            'downgraded' => $wasDowngraded,
            'previous_plan' => $previousPlan,
            'current_plan' => $this->plan,
            'expires_at' => $this->plan_expires_at,
        ];
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'plan_expires_at' => 'datetime',
        ];
    }

    /**
     * Get the identifier that will be stored in the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return custom claims for JWT.
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}
