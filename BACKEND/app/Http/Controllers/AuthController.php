<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OtpCode;
use App\Models\Notification;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Step 1: Send OTP to email for registration
     */
    public function sendRegisterOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Store registration data temporarily in cache (15 minutes)
        $cacheKey = 'register_' . $request->email;
        Cache::put($cacheKey, [
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'phone' => $request->phone,
        ], now()->addMinutes(15));

        // Generate and send OTP
        $otpRecord = OtpCode::generateOtp($request->email, 'register');

        try {
            Mail::to($request->email)->send(new OtpMail($otpRecord->otp, $request->name));

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP telah dikirim ke email Anda',
                'email' => $request->email
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email OTP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Step 2: Verify OTP and complete registration
     */
    public function verifyOtpAndRegister(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify OTP
        if (!OtpCode::verifyOtp($request->email, $request->otp, 'register')) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa'
            ], 400);
        }

        // Get cached registration data
        $cacheKey = 'register_' . $request->email;
        $registrationData = Cache::get($cacheKey);

        if (!$registrationData) {
            return response()->json([
                'success' => false,
                'message' => 'Data pendaftaran tidak ditemukan. Silakan ulangi proses pendaftaran'
            ], 400);
        }

        // Create user
        $user = User::create([
            'name' => $registrationData['name'],
            'email' => $registrationData['email'],
            'password' => Hash::make($registrationData['password']),
            'phone' => $registrationData['phone'],
            'email_verified_at' => now(),
            'role' => 'user',
        ]);

        // Clear cache
        Cache::forget($cacheKey);

        // Create admin notification for new user signup
        Notification::createForAdmin(
            Notification::TYPE_NEW_USER,
            'User Baru Terdaftar',
            "User baru '{$user->name}' ({$user->email}) telah mendaftar.",
            [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
            ]
        );

        // Generate JWT token
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil',
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60
        ], 201);
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'type' => 'required|string|in:register,reset_password',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if registration data exists for register type
        if ($request->type === 'register') {
            $cacheKey = 'register_' . $request->email;
            $registrationData = Cache::get($cacheKey);

            if (!$registrationData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data pendaftaran tidak ditemukan. Silakan ulangi proses pendaftaran'
                ], 400);
            }

            $name = $registrationData['name'];
        } else {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email tidak terdaftar'
                ], 404);
            }
            $name = $user->name;
        }

        // Generate new OTP
        $otpRecord = OtpCode::generateOtp($request->email, $request->type);

        try {
            Mail::to($request->email)->send(new OtpMail($otpRecord->otp, $name));

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP baru telah dikirim ke email Anda'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email OTP'
            ], 500);
        }
    }

    /**
     * Login user and return a JWT token.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password salah'
                ], 401);
            }
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not create token'
            ], 500);
        }

        $user = auth()->user();

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function me()
    {
        return response()->json([
            'success' => true,
            'user' => auth()->user()
        ]);
    }

    /**
     * Logout user (invalidate token).
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json([
                'success' => true,
                'message' => 'Berhasil logout'
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal logout'
            ], 500);
        }
    }

    /**
     * Refresh JWT token.
     */
    public function refresh()
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());
            return response()->json([
                'success' => true,
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not refresh token'
            ], 500);
        }
    }

    /**
     * Step 1: Send OTP to email for password reset
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak terdaftar'
            ], 404);
        }

        // Generate and send OTP
        $otpRecord = OtpCode::generateOtp($request->email, 'reset_password');

        try {
            Mail::to($request->email)->send(new OtpMail($otpRecord->otp, $user->name, 'reset_password'));

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP telah dikirim ke email Anda',
                'email' => $request->email
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email OTP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Step 2: Verify OTP for password reset
     */
    public function verifyResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify OTP without marking as used
        $otpRecord = OtpCode::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('type', 'reset_password')
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP valid. Silakan buat password baru.',
            'email' => $request->email
        ]);
    }

    /**
     * Step 3: Reset password with new password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify and consume OTP
        if (!OtpCode::verifyOtp($request->email, $request->otp, 'reset_password')) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa'
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak terdaftar'
            ], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset. Silakan login dengan password baru.'
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'role' => 'sometimes|nullable|string|max:255',
            'bio' => 'sometimes|nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }
        if ($request->has('role')) {
            $user->role = $request->role;
        }
        if ($request->has('bio')) {
            $user->bio = $request->bio;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'user' => $user
        ]);
    }

    /**
     * Upload avatar
     */
    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();

        // Delete old avatar if exists
        if ($user->avatar_url) {
            $oldPath = str_replace('/storage/', '', $user->avatar_url);
            if (\Storage::disk('public')->exists($oldPath)) {
                \Storage::disk('public')->delete($oldPath);
            }
        }

        // Store new avatar
        $file = $request->file('avatar');
        $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('avatars', $filename, 'public');

        // Update user avatar_url
        $user->avatar_url = '/storage/' . $path;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Avatar berhasil diupload',
            'avatar_url' => $user->avatar_url,
            'user' => $user
        ]);
    }

    /**
     * Delete avatar
     */
    public function deleteAvatar()
    {
        $user = auth()->user();

        if ($user->avatar_url) {
            $oldPath = str_replace('/storage/', '', $user->avatar_url);
            if (\Storage::disk('public')->exists($oldPath)) {
                \Storage::disk('public')->delete($oldPath);
            }
            
            $user->avatar_url = null;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Avatar berhasil dihapus',
            'user' => $user
        ]);
    }
}
