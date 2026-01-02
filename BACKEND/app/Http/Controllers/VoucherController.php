<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Voucher;
use Illuminate\Validation\Rule;

class VoucherController extends Controller
{
    /**
     * Admin: Get all vouchers
     */
    public function index()
    {
        $vouchers = Voucher::orderBy('created_at', 'desc')->get()->map(function ($voucher) {
            return [
                'id' => $voucher->id,
                'code' => $voucher->code,
                'discount_percent' => $voucher->discount_percent,
                'limit_user' => $voucher->limit_user,
                'used_count' => $voucher->used_count,
                'expires_at' => $voucher->expires_at->toISOString(),
                'is_active' => $voucher->is_active,
                'status' => $voucher->status,
                'status_label' => $voucher->status_label,
                'created_at' => $voucher->created_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $vouchers
        ]);
    }

    /**
     * Admin: Create new voucher
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:vouchers,code',
            'discount_percent' => 'required|integer|min:1|max:100',
            'limit_user' => 'required|integer|min:1',
            'expires_at' => 'required|date|after:today',
            'is_active' => 'boolean',
        ], [
            'code.unique' => 'Kode voucher sudah digunakan',
            'discount_percent.max' => 'Diskon tidak boleh lebih dari 100%',
            'expires_at.after' => 'Tanggal kadaluarsa harus di masa depan',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $voucher = Voucher::create([
            'code' => strtoupper($request->code),
            'discount_percent' => $request->discount_percent,
            'limit_user' => $request->limit_user,
            'expires_at' => $request->expires_at,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil dibuat',
            'data' => [
                'id' => $voucher->id,
                'code' => $voucher->code,
                'discount_percent' => $voucher->discount_percent,
                'limit_user' => $voucher->limit_user,
                'used_count' => $voucher->used_count,
                'expires_at' => $voucher->expires_at->toISOString(),
                'is_active' => $voucher->is_active,
                'status' => $voucher->status,
                'status_label' => $voucher->status_label,
            ]
        ], 201);
    }

    /**
     * Admin: Update voucher
     */
    public function update(Request $request, $id)
    {
        $voucher = Voucher::find($id);
        
        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('vouchers', 'code')->ignore($id)],
            'discount_percent' => 'sometimes|integer|min:1|max:100',
            'limit_user' => 'sometimes|integer|min:1',
            'expires_at' => 'sometimes|date',
            'is_active' => 'sometimes|boolean',
        ], [
            'code.unique' => 'Kode voucher sudah digunakan',
            'discount_percent.max' => 'Diskon tidak boleh lebih dari 100%',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('code')) {
            $voucher->code = strtoupper($request->code);
        }
        if ($request->has('discount_percent')) {
            $voucher->discount_percent = $request->discount_percent;
        }
        if ($request->has('limit_user')) {
            $voucher->limit_user = $request->limit_user;
        }
        if ($request->has('expires_at')) {
            $voucher->expires_at = $request->expires_at;
        }
        if ($request->has('is_active')) {
            $voucher->is_active = $request->is_active;
        }

        $voucher->save();

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil diperbarui',
            'data' => [
                'id' => $voucher->id,
                'code' => $voucher->code,
                'discount_percent' => $voucher->discount_percent,
                'limit_user' => $voucher->limit_user,
                'used_count' => $voucher->used_count,
                'expires_at' => $voucher->expires_at->toISOString(),
                'is_active' => $voucher->is_active,
                'status' => $voucher->status,
                'status_label' => $voucher->status_label,
            ]
        ]);
    }

    /**
     * Admin: Delete voucher
     */
    public function destroy($id)
    {
        $voucher = Voucher::find($id);
        
        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher tidak ditemukan'
            ], 404);
        }

        $voucher->delete();

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil dihapus'
        ]);
    }

    /**
     * Admin: Toggle voucher active status
     */
    public function toggle($id)
    {
        $voucher = Voucher::find($id);
        
        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher tidak ditemukan'
            ], 404);
        }

        $voucher->is_active = !$voucher->is_active;
        $voucher->save();

        return response()->json([
            'success' => true,
            'message' => $voucher->is_active ? 'Voucher diaktifkan' : 'Voucher dinonaktifkan',
            'data' => [
                'id' => $voucher->id,
                'is_active' => $voucher->is_active,
                'status' => $voucher->status,
                'status_label' => $voucher->status_label,
            ]
        ]);
    }

    /**
     * User: Validate voucher code
     */
    public function validate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Kode voucher diperlukan'
            ], 422);
        }

        $code = strtoupper(trim($request->code));
        $voucher = Voucher::where('code', $code)->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Kode voucher tidak ditemukan'
            ]);
        }

        if (!$voucher->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher tidak aktif'
            ]);
        }

        if ($voucher->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher sudah kadaluarsa'
            ]);
        }

        if ($voucher->isLimitReached()) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher sudah mencapai batas penggunaan'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Voucher valid',
            'data' => [
                'code' => $voucher->code,
                'discount_percent' => $voucher->discount_percent,
            ]
        ]);
    }
}
