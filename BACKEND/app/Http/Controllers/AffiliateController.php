<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\AffiliateSetting;
use App\Models\UserAffiliate;
use App\Models\ReferralTransaction;
use App\Models\Withdrawal;
use App\Models\Notification;

class AffiliateController extends Controller
{
    /**
     * Get affiliate settings (public for WhatsApp number)
     */
    public function getSettings(): JsonResponse
    {
        try {
            $settings = AffiliateSetting::getSettings();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'whatsapp_cs' => $settings->whatsapp_cs,
                    'commission_percentage' => (float) $settings->commission_percentage,
                    'discount_percentage' => (float) $settings->discount_percentage,
                    'min_withdrawal' => (float) $settings->min_withdrawal,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Get affiliate settings error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get settings'
            ], 500);
        }
    }

    /**
     * Get current user's affiliate status
     */
    public function getMyAffiliate(): JsonResponse
    {
        try {
            $user = auth()->user();
            $affiliate = UserAffiliate::where('user_id', $user->id)->first();
            $settings = AffiliateSetting::getSettings();

            if (!$affiliate) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'is_affiliate' => false,
                        'settings' => [
                            'whatsapp_cs' => $settings->whatsapp_cs,
                            'commission_percentage' => (float) $settings->commission_percentage,
                            'discount_percentage' => (float) $settings->discount_percentage,
                            'min_withdrawal' => (float) $settings->min_withdrawal,
                        ]
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'is_affiliate' => true,
                    'affiliate' => [
                        'id' => $affiliate->id,
                        'referral_code' => $affiliate->referral_code,
                        'is_active' => $affiliate->is_active,
                        'balance' => (float) $affiliate->balance,
                        'total_earned' => (float) $affiliate->total_earned,
                        'total_referrals' => $affiliate->total_referrals,
                        'created_at' => $affiliate->created_at->toISOString(),
                    ],
                    'settings' => [
                        'whatsapp_cs' => $settings->whatsapp_cs,
                        'commission_percentage' => (float) $settings->commission_percentage,
                        'discount_percentage' => (float) $settings->discount_percentage,
                        'min_withdrawal' => (float) $settings->min_withdrawal,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Get my affiliate error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get affiliate data'
            ], 500);
        }
    }

    /**
     * Register as affiliate
     */
    public function register(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Check if already registered
            $existing = UserAffiliate::where('user_id', $user->id)->first();
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are already registered as an affiliate'
                ], 400);
            }

            // Generate referral code
            $referralCode = UserAffiliate::generateUniqueCode();
            
            Log::info('Creating affiliate', [
                'user_id' => $user->id,
                'referral_code' => $referralCode,
                'code_length' => strlen($referralCode)
            ]);

            // Create affiliate with inactive status
            $affiliate = UserAffiliate::create([
                'user_id' => $user->id,
                'referral_code' => $referralCode,
                'is_active' => false,
                'balance' => 0,
                'total_earned' => 0,
                'total_referrals' => 0,
            ]);

            $settings = AffiliateSetting::getSettings();

            return response()->json([
                'success' => true,
                'message' => 'Successfully registered as affiliate. Please contact CS via WhatsApp for activation.',
                'data' => [
                    'affiliate' => [
                        'id' => $affiliate->id,
                        'referral_code' => $affiliate->referral_code,
                        'is_active' => $affiliate->is_active,
                    ],
                    'whatsapp_cs' => $settings->whatsapp_cs,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Register affiliate error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to register as affiliate: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update referral code (custom code)
     */
    public function updateCode(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'referral_code' => 'required|string|min:4|max:15|alpha_num'
            ]);

            $user = auth()->user();
            $affiliate = UserAffiliate::where('user_id', $user->id)->first();

            if (!$affiliate) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not registered as an affiliate'
                ], 400);
            }

            if (!$affiliate->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your affiliate account must be active to change the code'
                ], 400);
            }

            $newCode = strtoupper($request->referral_code);

            // Check if code is taken
            $exists = UserAffiliate::where('referral_code', $newCode)
                ->where('id', '!=', $affiliate->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'This referral code is already taken'
                ], 400);
            }

            $affiliate->update(['referral_code' => $newCode]);

            return response()->json([
                'success' => true,
                'message' => 'Referral code updated successfully',
                'data' => [
                    'referral_code' => $affiliate->referral_code
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Update referral code error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update referral code'
            ], 500);
        }
    }

    /**
     * Validate referral code (for payment form)
     */
    public function validateCode(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'referral_code' => 'required|string'
            ]);

            $user = auth()->user();
            $code = strtoupper($request->referral_code);

            $affiliate = UserAffiliate::where('referral_code', $code)
                ->where('is_active', true)
                ->first();

            if (!$affiliate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or inactive referral code'
                ], 400);
            }

            // Cannot use own code
            if ($affiliate->user_id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot use your own referral code'
                ], 400);
            }

            $settings = AffiliateSetting::getSettings();

            return response()->json([
                'success' => true,
                'message' => 'Valid referral code',
                'data' => [
                    'discount_percentage' => (float) $settings->discount_percentage,
                    'affiliate_name' => $affiliate->user->name,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Validate referral code error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate referral code'
            ], 500);
        }
    }

    /**
     * Get referral transactions for current affiliate
     */
    public function getTransactions(): JsonResponse
    {
        try {
            $user = auth()->user();
            $affiliate = UserAffiliate::where('user_id', $user->id)->first();

            if (!$affiliate) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $transactions = ReferralTransaction::with('referredUser:id,name,email')
                ->where('affiliate_id', $affiliate->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($tx) {
                    return [
                        'id' => $tx->id,
                        'referred_user' => [
                            'name' => $tx->referredUser->name,
                            'email' => $this->maskEmail($tx->referredUser->email),
                        ],
                        'order_amount' => (float) $tx->order_amount,
                        'discount_given' => (float) $tx->discount_given,
                        'commission_earned' => (float) $tx->commission_earned,
                        'plan_name' => $tx->plan_name,
                        'status' => $tx->status,
                        'date' => $tx->created_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            Log::error('Get transactions error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get transactions'
            ], 500);
        }
    }

    /**
     * Get earnings statistics
     */
    public function getStats(): JsonResponse
    {
        try {
            $user = auth()->user();
            $affiliate = UserAffiliate::where('user_id', $user->id)->first();

            if (!$affiliate) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'is_affiliate' => false,
                    ]
                ]);
            }

            // Get monthly earnings for chart (last 6 months)
            $monthlyEarnings = ReferralTransaction::where('affiliate_id', $affiliate->id)
                ->where('status', 'completed')
                ->where('created_at', '>=', now()->subMonths(6))
                ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(commission_earned) as total, COUNT(*) as referrals')
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            // Get pending withdrawals total
            $pendingWithdrawals = Withdrawal::where('affiliate_id', $affiliate->id)
                ->where('status', 'pending')
                ->sum('amount');

            // Get approved withdrawals total
            $totalWithdrawals = Withdrawal::where('affiliate_id', $affiliate->id)
                ->where('status', 'approved')
                ->sum('amount');

            // Get this month earnings
            $thisMonthEarnings = ReferralTransaction::where('affiliate_id', $affiliate->id)
                ->where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('commission_earned');

            return response()->json([
                'success' => true,
                'data' => [
                    'is_affiliate' => true,
                    'balance' => (float) $affiliate->balance,
                    'total_earned' => (float) $affiliate->total_earned,
                    'total_referrals' => $affiliate->total_referrals,
                    'pending_withdrawals' => (float) $pendingWithdrawals,
                    'total_withdrawals' => (float) $totalWithdrawals,
                    'this_month_earnings' => (float) $thisMonthEarnings,
                    'monthly_earnings' => $monthlyEarnings->map(function ($item) {
                        $monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return [
                            'month' => $monthNames[$item->month],
                            'year' => $item->year,
                            'earnings' => (float) $item->total,
                            'referrals' => $item->referrals,
                        ];
                    }),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Get affiliate stats error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get statistics'
            ], 500);
        }
    }

    /**
     * Request withdrawal
     */
    public function requestWithdrawal(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'payment_method' => 'required|in:bank_transfer,dana,gopay,ovo,shopeepay',
                'bank_name' => 'required_if:payment_method,bank_transfer|nullable|string|max:100',
                'account_name' => 'required|string|max:100',
                'account_number' => 'required|string|max:50',
            ]);

            $user = auth()->user();
            $affiliate = UserAffiliate::where('user_id', $user->id)->first();

            if (!$affiliate || !$affiliate->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not an active affiliate'
                ], 400);
            }

            $settings = AffiliateSetting::getSettings();
            $amount = $request->amount;

            // Check minimum withdrawal
            if ($amount < $settings->min_withdrawal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Minimum withdrawal is Rp ' . number_format($settings->min_withdrawal, 0, ',', '.')
                ], 400);
            }

            // Check balance
            if ($affiliate->balance < $amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient balance'
                ], 400);
            }

            DB::beginTransaction();
            try {
                // Deduct balance first
                $affiliate->deductBalance($amount);

                // Create withdrawal request
                $withdrawal = Withdrawal::create([
                    'affiliate_id' => $affiliate->id,
                    'amount' => $amount,
                    'payment_method' => $request->payment_method,
                    'bank_name' => $request->bank_name,
                    'account_name' => $request->account_name,
                    'account_number' => $request->account_number,
                    'status' => 'pending',
                ]);

                // Create admin notification for new withdrawal request
                Notification::createForAdmin(
                    Notification::TYPE_NEW_WITHDRAWAL,
                    'Permintaan Withdrawal Baru',
                    "User '{$user->name}' mengajukan withdrawal sebesar Rp " . number_format($amount, 0, ',', '.'),
                    [
                        'withdrawal_id' => $withdrawal->id,
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'amount' => $amount,
                        'payment_method' => $request->payment_method,
                    ]
                );

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Withdrawal request submitted successfully',
                    'data' => [
                        'withdrawal_id' => $withdrawal->id,
                        'amount' => (float) $withdrawal->amount,
                        'new_balance' => (float) $affiliate->balance,
                    ]
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Request withdrawal error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to request withdrawal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get withdrawal history
     */
    public function getWithdrawals(): JsonResponse
    {
        try {
            $user = auth()->user();
            $affiliate = UserAffiliate::where('user_id', $user->id)->first();

            if (!$affiliate) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $withdrawals = Withdrawal::where('affiliate_id', $affiliate->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($w) {
                    return [
                        'id' => $w->id,
                        'amount' => (float) $w->amount,
                        'payment_method' => $w->payment_method,
                        'payment_method_label' => Withdrawal::PAYMENT_METHODS[$w->payment_method] ?? $w->payment_method,
                        'bank_name' => $w->bank_name,
                        'account_name' => $w->account_name,
                        'account_number' => $w->account_number,
                        'status' => $w->status,
                        'admin_notes' => $w->admin_notes,
                        'processed_at' => $w->processed_at?->toISOString(),
                        'created_at' => $w->created_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $withdrawals
            ]);
        } catch (\Exception $e) {
            Log::error('Get withdrawals error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get withdrawals'
            ], 500);
        }
    }

    /**
     * Helper: Mask email
     */
    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        $name = $parts[0];
        $domain = $parts[1] ?? '';
        
        $maskedName = substr($name, 0, 3) . '***';
        
        return $maskedName . '@' . $domain;
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Admin: Get all affiliates
     */
    public function adminGetAffiliates(Request $request): JsonResponse
    {
        try {
            $query = UserAffiliate::with('user:id,name,email');

            // Filter by status
            if ($request->has('status')) {
                $query->where('is_active', $request->status === 'active');
            }

            $affiliates = $query->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($a) {
                    return [
                        'id' => $a->id,
                        'user' => [
                            'id' => $a->user->id,
                            'name' => $a->user->name,
                            'email' => $a->user->email,
                        ],
                        'referral_code' => $a->referral_code,
                        'is_active' => $a->is_active,
                        'balance' => (float) $a->balance,
                        'total_earned' => (float) $a->total_earned,
                        'total_referrals' => $a->total_referrals,
                        'created_at' => $a->created_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $affiliates
            ]);
        } catch (\Exception $e) {
            Log::error('Admin get affiliates error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get affiliates'
            ], 500);
        }
    }

    /**
     * Admin: Toggle affiliate status
     */
    public function adminToggleStatus(int $id): JsonResponse
    {
        try {
            $affiliate = UserAffiliate::findOrFail($id);
            $affiliate->update(['is_active' => !$affiliate->is_active]);

            return response()->json([
                'success' => true,
                'message' => $affiliate->is_active ? 'Affiliate activated' : 'Affiliate deactivated',
                'data' => [
                    'is_active' => $affiliate->is_active
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Admin toggle status error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle status'
            ], 500);
        }
    }

    /**
     * Admin: Update settings
     */
    public function adminUpdateSettings(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'whatsapp_cs' => 'nullable|string|max:20',
                'commission_percentage' => 'nullable|numeric|min:0|max:100',
                'discount_percentage' => 'nullable|numeric|min:0|max:100',
                'min_withdrawal' => 'nullable|numeric|min:0',
            ]);

            $settings = AffiliateSetting::getSettings();
            $settings->update($request->only([
                'whatsapp_cs',
                'commission_percentage',
                'discount_percentage',
                'min_withdrawal',
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('Admin update settings error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings'
            ], 500);
        }
    }

    /**
     * Admin: Get all withdrawals
     */
    public function adminGetWithdrawals(Request $request): JsonResponse
    {
        try {
            $query = Withdrawal::with(['affiliate.user:id,name,email']);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $withdrawals = $query->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($w) {
                    return [
                        'id' => $w->id,
                        'affiliate' => [
                            'id' => $w->affiliate->id,
                            'user_name' => $w->affiliate->user->name,
                            'user_email' => $w->affiliate->user->email,
                        ],
                        'amount' => (float) $w->amount,
                        'payment_method' => $w->payment_method,
                        'payment_method_label' => Withdrawal::PAYMENT_METHODS[$w->payment_method] ?? $w->payment_method,
                        'bank_name' => $w->bank_name,
                        'account_name' => $w->account_name,
                        'account_number' => $w->account_number,
                        'status' => $w->status,
                        'admin_notes' => $w->admin_notes,
                        'processed_at' => $w->processed_at?->toISOString(),
                        'created_at' => $w->created_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $withdrawals
            ]);
        } catch (\Exception $e) {
            Log::error('Admin get withdrawals error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get withdrawals'
            ], 500);
        }
    }

    /**
     * Admin: Process withdrawal (approve/reject)
     */
    public function adminProcessWithdrawal(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'action' => 'required|in:approve,reject',
                'notes' => 'required_if:action,reject|nullable|string|max:500',
            ]);

            $withdrawal = Withdrawal::with('affiliate.user')->findOrFail($id);

            if (!$withdrawal->canProcess()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This withdrawal has already been processed'
                ], 400);
            }

            $userId = $withdrawal->affiliate->user->id;
            $amount = $withdrawal->amount;

            if ($request->action === 'approve') {
                $withdrawal->approve($request->notes);
                $message = 'Withdrawal approved successfully';

                // Create user notification for approved withdrawal
                Notification::createForUser(
                    $userId,
                    Notification::TYPE_WITHDRAWAL_APPROVED,
                    'Withdrawal Disetujui',
                    "Withdrawal sebesar Rp " . number_format($amount, 0, ',', '.') . " telah disetujui dan akan segera diproses.",
                    [
                        'withdrawal_id' => $withdrawal->id,
                        'amount' => $amount,
                    ]
                );
            } else {
                $withdrawal->reject($request->notes);
                $message = 'Withdrawal rejected and balance restored';

                // Create user notification for rejected withdrawal
                Notification::createForUser(
                    $userId,
                    Notification::TYPE_WITHDRAWAL_REJECTED,
                    'Withdrawal Ditolak',
                    "Withdrawal sebesar Rp " . number_format($amount, 0, ',', '.') . " ditolak. Alasan: " . $request->notes . ". Saldo Anda telah dikembalikan.",
                    [
                        'withdrawal_id' => $withdrawal->id,
                        'amount' => $amount,
                        'reason' => $request->notes,
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'status' => $withdrawal->status
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Admin process withdrawal error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to process withdrawal'
            ], 500);
        }
    }
}
