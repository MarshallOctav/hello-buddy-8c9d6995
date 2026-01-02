<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->integer('discount_percent')->unsigned();
            $table->integer('limit_user')->unsigned();
            $table->integer('used_count')->unsigned()->default(0);
            $table->timestamp('expires_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['code', 'is_active']);
            $table->index('expires_at');
        });

        // Add voucher_id to payments table for tracking
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('voucher_id')->nullable()->after('transaction_id')->constrained('vouchers')->nullOnDelete();
            $table->decimal('original_amount', 12, 2)->nullable()->after('amount');
            $table->decimal('voucher_discount', 12, 2)->nullable()->after('original_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['voucher_id']);
            $table->dropColumn(['voucher_id', 'original_amount', 'voucher_discount']);
        });
        
        Schema::dropIfExists('vouchers');
    }
};
