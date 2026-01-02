<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TestResultController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AffiliateController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\VoucherController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes

// Public plans (for pricing page)
Route::get('/plans', [PaymentController::class, 'getPlans']);

// Public affiliate settings (for WhatsApp number)
Route::get('/affiliate/settings', [AffiliateController::class, 'getSettings']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'sendRegisterOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtpAndRegister']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Forgot password routes
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-reset-otp', [AuthController::class, 'verifyResetOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Protected routes
Route::middleware('auth:api')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/update-profile', [AuthController::class, 'updateProfile']);
    Route::post('/upload-avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/delete-avatar', [AuthController::class, 'deleteAvatar']);
});

// Test Results routes (protected)
Route::middleware('auth:api')->group(function () {
    Route::post('/test-results', [TestResultController::class, 'store']);
    Route::get('/test-results', [TestResultController::class, 'index']);
    Route::get('/user-stats', [TestResultController::class, 'getStats']);
    Route::get('/leaderboard', [TestResultController::class, 'getLeaderboard']);
    
    // Badge routes
    Route::get('/badges', [BadgeController::class, 'index']);
    Route::post('/badges/check', [BadgeController::class, 'checkAndAwardBadges']);
});

// Payment routes
Route::get('/payment/client-key', [PaymentController::class, 'getClientKey']);
Route::post('/payment/notification', [PaymentController::class, 'handleNotification']);

Route::middleware('auth:api')->prefix('payment')->group(function () {
    Route::post('/create-transaction', [PaymentController::class, 'createTransaction']);
    Route::post('/check-status', [PaymentController::class, 'checkStatus']);
    Route::post('/verify-upgrade', [PaymentController::class, 'verifyAndUpgrade']);
    Route::get('/check-plan-expiry', [PaymentController::class, 'checkPlanExpiry']);
    Route::get('/history', [PaymentController::class, 'getPaymentHistory']);
    Route::post('/cancel-plan', [PaymentController::class, 'cancelPlan']);
});

// Voucher validation (for users)
Route::middleware('auth:api')->post('/voucher/validate', [VoucherController::class, 'validate']);

// Affiliate routes (protected)
Route::middleware('auth:api')->prefix('affiliate')->group(function () {
    Route::get('/me', [AffiliateController::class, 'getMyAffiliate']);
    Route::post('/register', [AffiliateController::class, 'register']);
    Route::put('/code', [AffiliateController::class, 'updateCode']);
    Route::post('/validate-code', [AffiliateController::class, 'validateCode']);
    Route::get('/transactions', [AffiliateController::class, 'getTransactions']);
    Route::get('/stats', [AffiliateController::class, 'getStats']);
    Route::post('/withdraw', [AffiliateController::class, 'requestWithdrawal']);
    Route::get('/withdrawals', [AffiliateController::class, 'getWithdrawals']);
});

// Notification routes (protected)
Route::middleware('auth:api')->prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
});

// Admin routes
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminController::class, 'login']);
    
    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AdminController::class, 'me']);
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/plans', [AdminController::class, 'plans']);
        Route::put('/plans/{id}', [AdminController::class, 'updatePlan']);
        
        // Admin affiliate routes
        Route::get('/affiliates', [AffiliateController::class, 'adminGetAffiliates']);
        Route::put('/affiliates/{id}/toggle', [AffiliateController::class, 'adminToggleStatus']);
        Route::put('/affiliate-settings', [AffiliateController::class, 'adminUpdateSettings']);
        Route::get('/withdrawals', [AffiliateController::class, 'adminGetWithdrawals']);
        Route::put('/withdrawals/{id}/process', [AffiliateController::class, 'adminProcessWithdrawal']);
        
        // Admin notification routes
        Route::get('/notifications', [NotificationController::class, 'adminIndex']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'adminUnreadCount']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'adminMarkAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'adminMarkAllAsRead']);
        
        // Admin voucher routes
        Route::get('/vouchers', [VoucherController::class, 'index']);
        Route::post('/vouchers', [VoucherController::class, 'store']);
        Route::put('/vouchers/{id}', [VoucherController::class, 'update']);
        Route::delete('/vouchers/{id}', [VoucherController::class, 'destroy']);
        Route::put('/vouchers/{id}/toggle', [VoucherController::class, 'toggle']);
    });
});
