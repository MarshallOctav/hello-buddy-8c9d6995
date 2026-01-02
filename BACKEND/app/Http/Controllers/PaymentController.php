<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Payment;
use App\Models\Plan;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private string $serverKey;
    private string $clientKey;
    private string $merchantId;
    private bool $isProduction;
    private string $baseUrl;

    public function __construct()
    {
        $this->serverKey = env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-rNRsF25WeION9IbRjzMgPmLY');
        $this->clientKey = env('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-QOu4l8AUw6BxfSJ1');
        $this->merchantId = env('MIDTRANS_MERCHANT_ID', 'G534574277');
        $this->isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        $this->baseUrl = $this->isProduction 
            ? 'https://app.midtrans.com/snap/v1' 
            : 'https://app.sandbox.midtrans.com/snap/v1';
    }

    /**
     * Get public plans (for pricing page)
     */
    public function getPlans()
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('price', 'asc')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->slug,
                    'name' => $plan->name,
                    'price' => $plan->price,
                    'duration_months' => $plan->duration_months,
                    'features' => $plan->features,
                ];
            });

        return response()->json([
            'success' => true,
            'plans' => $plans
        ]);
    }

    /**
     * Get client key for frontend Snap integration
     */
    public function getClientKey()
    {
        return response()->json([
            'success' => true,
            'client_key' => $this->clientKey,
            'is_production' => $this->isProduction
        ]);
    }

    /**
     * Create Snap transaction token
     */
    public function createTransaction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan' => 'required|string|in:PRO,PREMIUM',
            'referral_code' => 'nullable|string|max:20',
            'voucher_code' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $planSlug = $request->plan;
        $referralCode = $request->referral_code;
        $voucherCode = $request->voucher_code;

        // Get pricing from database - now using PRO and PREMIUM slugs directly
        $planData = Plan::where('slug', $planSlug)->first();
        
        if (!$planData) {
            return response()->json([
                'success' => false,
                'message' => 'Plan not found'
            ], 404);
        }

        $basePrice = $planData->price;
        $referralDiscount = 0;
        $voucherDiscount = 0;
        $referrerId = null;
        $voucherId = null;
        $settings = \App\Models\AffiliateSetting::getSettings();

        // Validate and apply referral code discount
        if ($referralCode) {
            $affiliate = \App\Models\UserAffiliate::where('referral_code', strtoupper($referralCode))
                ->where('is_active', true)
                ->first();
            
            if ($affiliate && $affiliate->user_id !== $user->id) {
                $discountPercentage = $settings->discount_percentage ?? 10;
                $referralDiscount = ($basePrice * $discountPercentage) / 100;
                $referrerId = $affiliate->user_id;
            }
        }

        // Validate and apply voucher code discount
        if ($voucherCode) {
            $voucher = \App\Models\Voucher::where('code', strtoupper($voucherCode))->first();
            
            if ($voucher && $voucher->isValid()) {
                $voucherDiscount = ($basePrice * $voucher->discount_percent) / 100;
                $voucherId = $voucher->id;
            }
        }

        $totalDiscount = $referralDiscount + $voucherDiscount;
        $finalPrice = max(0, $basePrice - $totalDiscount);

        $selectedPlan = [
            'name' => 'Diagnospace ' . $planData->name,
            'price' => $finalPrice,
            'original_price' => $basePrice,
            'referral_discount' => $referralDiscount,
            'voucher_discount' => $voucherDiscount,
            'description' => $planData->duration_months > 1 ? 'Yearly subscription' : 'Monthly subscription'
        ];
        $orderId = 'DIAG-' . $user->id . '-' . $planSlug . '-' . time();

        $itemDetails = [
            [
                'id' => $planSlug,
                'price' => $finalPrice,
                'quantity' => 1,
                'name' => $selectedPlan['name'],
            ]
        ];

        $transactionDetails = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $finalPrice
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ],
            'item_details' => $itemDetails,
            'callbacks' => [
                'finish' => env('APP_FRONTEND_URL', 'http://localhost:5173') . '/plans?payment=success',
                'error' => env('APP_FRONTEND_URL', 'http://localhost:5173') . '/plans?payment=error',
                'pending' => env('APP_FRONTEND_URL', 'http://localhost:5173') . '/plans?payment=pending',
            ],
            'custom_field1' => $planSlug,
            'custom_field2' => (string) $user->id,
            'custom_field3' => json_encode([
                'referrer_id' => $referrerId,
                'voucher_id' => $voucherId,
            ]),
        ];

        try {
            $response = $this->callMidtransApi('/transactions', $transactionDetails);

            if (isset($response['token'])) {
                // Immediately record the payment as pending
                $expiresAt = $planSlug === 'PREMIUM' ? now()->addYear() : now()->addMonth();
                
                $paymentData = [
                    'user_id' => $user->id,
                    'plan' => $planSlug,
                    'amount' => $finalPrice,
                    'original_amount' => $basePrice,
                    'voucher_id' => $voucherId,
                    'voucher_discount' => $voucherDiscount,
                    'status' => 'pending',
                    'expires_at' => $expiresAt,
                ];
                
                // Store referral info if referral code was used
                $paymentData['midtrans_response'] = [
                    'referrer_id' => $referrerId,
                    'original_price' => $basePrice,
                    'referral_discount' => $referralDiscount,
                    'voucher_discount' => $voucherDiscount,
                    'voucher_id' => $voucherId,
                    'referral_code' => $referralCode ? strtoupper($referralCode) : null,
                    'voucher_code' => $voucherCode ? strtoupper($voucherCode) : null,
                ];
                
                Payment::updateOrCreate(
                    ['order_id' => $orderId],
                    $paymentData
                );

                return response()->json([
                    'success' => true,
                    'token' => $response['token'],
                    'redirect_url' => $response['redirect_url'],
                    'order_id' => $orderId
                ]);
            }

            Log::error('Midtrans API error', ['response' => $response]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create transaction',
                'error' => $response
            ], 500);

        } catch (\Exception $e) {
            Log::error('Midtrans exception', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Midtrans notification callback
     */
    public function handleNotification(Request $request)
    {
        $notificationBody = $request->all();
        
        Log::info('Midtrans Notification received', $notificationBody);

        $orderId = $notificationBody['order_id'] ?? null;
        $transactionStatus = $notificationBody['transaction_status'] ?? null;
        $fraudStatus = $notificationBody['fraud_status'] ?? null;
        $signatureKey = $notificationBody['signature_key'] ?? null;

        // Verify signature
        $grossAmount = $notificationBody['gross_amount'] ?? '0';
        $statusCode = $notificationBody['status_code'] ?? '';
        $serverKey = $this->serverKey;
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $expectedSignature) {
            Log::warning('Invalid signature', ['order_id' => $orderId]);
            return response()->json(['success' => false, 'message' => 'Invalid signature'], 400);
        }

        // Parse order ID to get user info: DIAG-{userId}-{plan}-{timestamp}
        $parts = explode('-', $orderId);
        if (count($parts) < 4) {
            Log::error('Invalid order ID format', ['order_id' => $orderId]);
            return response()->json(['success' => false, 'message' => 'Invalid order ID'], 400);
        }

        $userId = $parts[1];
        $plan = $parts[2];

        $user = User::find($userId);
        if (!$user) {
            Log::error('User not found', ['user_id' => $userId]);
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // Handle transaction status
        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'accept') {
                $this->upgradePlan($user, $plan, $orderId, $notificationBody);
            }
        } else if ($transactionStatus == 'settlement') {
            $this->upgradePlan($user, $plan, $orderId, $notificationBody);
        } else if ($transactionStatus == 'pending') {
            $this->recordPayment($user, $plan, $orderId, 'pending', $notificationBody);
            Log::info('Payment pending', ['order_id' => $orderId]);
        } else if (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $this->recordPayment($user, $plan, $orderId, $transactionStatus, $notificationBody);
            Log::info('Payment failed', ['order_id' => $orderId, 'status' => $transactionStatus]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Upgrade user plan and record payment
     */
    private function upgradePlan(User $user, string $plan, string $orderId, array $midtransResponse)
    {
        $expiresAt = $plan === 'PREMIUM' ? now()->addYear() : now()->addMonth();

        $user->plan = $plan;
        $user->plan_expires_at = $expiresAt;
        $user->save();

        // Get existing payment to check for referral info
        $existingPayment = Payment::where('order_id', $orderId)->first();
        $referralData = $existingPayment?->midtrans_response;
        
        // Merge existing midtrans_response with new response
        $mergedResponse = array_merge($referralData ?? [], $midtransResponse);
        
        // Get actual amount from existing payment or midtrans response
        $amount = $existingPayment?->amount ?? (int) ($midtransResponse['gross_amount'] ?? 0);

        // Record the successful payment
        Payment::updateOrCreate(
            ['order_id' => $orderId],
            [
                'user_id' => $user->id,
                'plan' => $plan,
                'amount' => $amount,
                'payment_type' => $midtransResponse['payment_type'] ?? null,
                'status' => 'settlement',
                'transaction_id' => $midtransResponse['transaction_id'] ?? null,
                'paid_at' => now(),
                'expires_at' => $expiresAt,
                'midtrans_response' => $mergedResponse,
            ]
        );

        // Process referral commission if applicable
        if (!empty($referralData['referrer_id'])) {
            $this->processReferralCommission(
                $referralData['referrer_id'],
                $user,
                $referralData['original_price'] ?? $amount,
                $orderId,
                $referralData['referral_discount'] ?? 0,
                $plan
            );
        }

        // Increment voucher usage if applicable
        if (!empty($referralData['voucher_id'])) {
            $voucher = \App\Models\Voucher::find($referralData['voucher_id']);
            if ($voucher) {
                $voucher->incrementUsage();
            }
        }

        Log::info('User plan upgraded', [
            'user_id' => $user->id,
            'plan' => $plan,
            'expires_at' => $user->plan_expires_at
        ]);
    }

    /**
     * Process referral commission
     */
    private function processReferralCommission(int $referrerId, User $buyer, int $originalPrice, string $orderId, int $discountGiven = 0, string $planName = null)
    {
        $affiliate = \App\Models\UserAffiliate::where('user_id', $referrerId)->first();
        
        if (!$affiliate || !$affiliate->is_active) {
            Log::warning('Affiliate not found or inactive', ['referrer_id' => $referrerId]);
            return;
        }

        $settings = \App\Models\AffiliateSetting::getSettings();
        $commissionPercent = $settings->commission_percentage ?? 10;
        $commission = ($originalPrice * $commissionPercent) / 100;

        // Get the payment record to link the referral transaction
        $payment = Payment::where('order_id', $orderId)->first();

        // Create referral transaction with correct field names matching the model
        \App\Models\ReferralTransaction::create([
            'affiliate_id' => $affiliate->id,
            'referred_user_id' => $buyer->id,
            'payment_id' => $payment?->id,
            'order_amount' => $originalPrice,
            'discount_given' => $discountGiven,
            'commission_earned' => $commission,
            'plan_name' => $planName,
            'status' => 'completed',
        ]);

        // Update affiliate balance
        $affiliate->balance += $commission;
        $affiliate->total_earned += $commission;
        $affiliate->total_referrals += 1;
        $affiliate->save();

        // Create notification for affiliate
        \App\Models\Notification::createForUser(
            $referrerId,
            \App\Models\Notification::TYPE_REFERRAL_COMMISSION,
            'Komisi Referral Diterima!',
            'Selamat! Anda mendapat komisi Rp ' . number_format($commission, 0, ',', '.') . ' dari referral ' . $buyer->name . '.',
            [
                'commission' => $commission,
                'buyer_name' => $buyer->name,
                'order_id' => $orderId,
                'plan_name' => $planName,
            ]
        );

        Log::info('Referral commission processed successfully', [
            'affiliate_id' => $affiliate->id,
            'referrer_id' => $referrerId,
            'buyer_id' => $buyer->id,
            'commission' => $commission,
            'order_amount' => $originalPrice,
            'discount_given' => $discountGiven,
            'plan_name' => $planName,
        ]);
    }

    /**
     * Record payment (for non-success statuses)
     */
    private function recordPayment(User $user, string $plan, string $orderId, string $status, array $midtransResponse)
    {
        $pricing = [
            'PRO' => 299000,
            'PREMIUM' => 1499000,
        ];

        Payment::updateOrCreate(
            ['order_id' => $orderId],
            [
                'user_id' => $user->id,
                'plan' => $plan,
                'amount' => $pricing[$plan] ?? 0,
                'payment_type' => $midtransResponse['payment_type'] ?? null,
                'status' => $status,
                'transaction_id' => $midtransResponse['transaction_id'] ?? null,
                'midtrans_response' => $midtransResponse,
            ]
        );
    }

    /**
     * Check if user's plan is expired and downgrade to FREE if needed
     */
    public function checkPlanExpiry(Request $request)
    {
        $user = auth()->user();
        $result = $user->checkAndDowngradePlan();

        return response()->json([
            'success' => true,
            'data' => [
                'downgraded' => $result['downgraded'],
                'previous_plan' => $result['previous_plan'],
                'current_plan' => $result['current_plan'],
                'plan' => $result['current_plan'],
                'plan_expires_at' => $result['expires_at'],
            ]
        ]);
    }

    /**
     * Cancel/End user's current plan and downgrade to FREE
     */
    public function cancelPlan(Request $request)
    {
        $user = auth()->user();
        
        if ($user->plan === 'FREE') {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah menggunakan paket Free'
            ], 400);
        }

        $previousPlan = $user->plan;
        $user->plan = 'FREE';
        $user->plan_expires_at = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Paket berhasil diakhiri',
            'data' => [
                'previous_plan' => $previousPlan,
                'current_plan' => 'FREE'
            ]
        ]);
    }

    /**
     * Get user's payment history
     */
    public function getPaymentHistory(Request $request)
    {
        $user = auth()->user();
        
        $payments = Payment::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'plan' => $payment->plan,
                    'plan_name' => $payment->plan_name,
                    'amount' => $payment->amount,
                    'formatted_amount' => 'Rp ' . number_format($payment->amount, 0, ',', '.'),
                    'payment_type' => $payment->payment_type,
                    'status' => $payment->status,
                    'status_label' => $payment->status_label,
                    'paid_at' => $payment->paid_at?->toISOString(),
                    'expires_at' => $payment->expires_at?->toISOString(),
                    'created_at' => $payment->created_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Check transaction status
     */
    public function checkStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $statusUrl = $this->isProduction
                ? 'https://api.midtrans.com/v2/' . $request->order_id . '/status'
                : 'https://api.sandbox.midtrans.com/v2/' . $request->order_id . '/status';

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $statusUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Basic ' . base64_encode($this->serverKey . ':'),
                'Content-Type: application/json',
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $result = json_decode($response, true);

            return response()->json([
                'success' => $httpCode == 200,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify payment status and upgrade user plan
     * Called by frontend after Snap popup closes with success
     */
    public function verifyAndUpgrade(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $orderId = $request->order_id;

        // Verify order belongs to this user
        $payment = Payment::where('order_id', $orderId)
            ->where('user_id', $user->id)
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found or not authorized'
            ], 404);
        }

        // If already settled, return current status
        if ($payment->status === 'settlement') {
            return response()->json([
                'success' => true,
                'message' => 'Payment already processed',
                'data' => [
                    'plan' => $user->plan,
                    'plan_expires_at' => $user->plan_expires_at,
                    'payment_status' => $payment->status
                ]
            ]);
        }

        try {
            // Check status directly from Midtrans API
            $statusUrl = $this->isProduction
                ? 'https://api.midtrans.com/v2/' . $orderId . '/status'
                : 'https://api.sandbox.midtrans.com/v2/' . $orderId . '/status';

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $statusUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Basic ' . base64_encode($this->serverKey . ':'),
                'Content-Type: application/json',
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to verify payment status with Midtrans'
                ], 500);
            }

            $midtransResponse = json_decode($response, true);
            $transactionStatus = $midtransResponse['transaction_status'] ?? null;
            $fraudStatus = $midtransResponse['fraud_status'] ?? null;

            Log::info('Verify and upgrade - Midtrans status', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus
            ]);

            // Check if payment is successful
            $isSuccess = false;
            if ($transactionStatus === 'capture') {
                $isSuccess = ($fraudStatus === 'accept');
            } else if ($transactionStatus === 'settlement') {
                $isSuccess = true;
            }

            if ($isSuccess) {
                // Update user plan
                $plan = $payment->plan;
                $expiresAt = $plan === 'PREMIUM' ? now()->addYear() : now()->addMonth();

                $user->plan = $plan;
                $user->plan_expires_at = $expiresAt;
                $user->save();

                // Get existing referral data from payment
                $existingMidtransData = $payment->midtrans_response ?? [];
                $mergedResponse = array_merge($existingMidtransData, $midtransResponse);

                // Update payment record
                $payment->update([
                    'status' => 'settlement',
                    'payment_type' => $midtransResponse['payment_type'] ?? null,
                    'transaction_id' => $midtransResponse['transaction_id'] ?? null,
                    'paid_at' => now(),
                    'expires_at' => $expiresAt,
                    'midtrans_response' => $mergedResponse,
                ]);

                // Process referral commission if applicable
                if (!empty($existingMidtransData['referrer_id'])) {
                    $this->processReferralCommission(
                        $existingMidtransData['referrer_id'],
                        $user,
                        $existingMidtransData['original_price'] ?? $payment->amount,
                        $orderId
                    );
                }

                Log::info('User plan upgraded via verify-and-upgrade', [
                    'user_id' => $user->id,
                    'plan' => $plan,
                    'expires_at' => $expiresAt
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Plan upgraded successfully',
                    'data' => [
                        'plan' => $plan,
                        'plan_expires_at' => $expiresAt->toISOString(),
                        'payment_status' => 'settlement'
                    ]
                ]);
            } else {
                // Update payment status if changed
                if ($transactionStatus && $payment->status !== $transactionStatus) {
                    $payment->update([
                        'status' => $transactionStatus,
                        'midtrans_response' => $midtransResponse,
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Payment not yet successful',
                    'data' => [
                        'transaction_status' => $transactionStatus,
                        'payment_status' => $payment->status
                    ]
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Verify and upgrade exception', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Call Midtrans API
     */
    private function callMidtransApi(string $endpoint, array $data)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Basic ' . base64_encode($this->serverKey . ':'),
            'Content-Type: application/json',
            'Accept: application/json',
        ]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception('Curl error: ' . $error);
        }

        return json_decode($response, true);
    }
}
