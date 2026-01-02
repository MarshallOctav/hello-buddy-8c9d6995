<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Payment;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AdminController extends Controller
{
    /**
     * Admin login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Hanya admin yang diperbolehkan.'], 403);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Get current admin
     */
    public function me(Request $request)
    {
        $user = auth()->user();
        
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json(['user' => $user]);
    }

    /**
     * Get dashboard stats
     */
    public function stats()
    {
        $totalUsers = User::where(function($q) {
            $q->where('role', '!=', 'admin')
              ->orWhereNull('role');
        })->count();
        $totalPayments = Payment::where('status', 'paid')->count();
        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        $activeSubscriptions = User::where('plan', '!=', 'FREE')
            ->where(function($query) {
                $query->whereNull('plan_expires_at')
                    ->orWhere('plan_expires_at', '>', now());
            })
            ->count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalPayments' => $totalPayments,
            'totalRevenue' => $totalRevenue,
            'activeSubscriptions' => $activeSubscriptions,
        ]);
    }

    /**
     * Get all users with pagination
     */
    public function users(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search');

        $query = User::where(function($q) {
            $q->where('role', '!=', 'admin')
              ->orWhereNull('role');
        });

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Delete a user
     */
    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Tidak bisa menghapus admin'], 403);
        }

        // Delete related data
        $user->payments()->delete();
        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus']);
    }

    /**
     * Get all plans from database
     */
    public function plans()
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

        return response()->json(['plans' => $plans]);
    }

    /**
     * Update plan price in database
     */
    public function updatePlan(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $plan = Plan::where('slug', $id)->first();

        if (!$plan) {
            return response()->json(['message' => 'Plan tidak ditemukan'], 404);
        }

        $plan->price = $request->price;
        $plan->save();

        return response()->json(['message' => 'Harga plan berhasil diperbarui']);
    }
}
