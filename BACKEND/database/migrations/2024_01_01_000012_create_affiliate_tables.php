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
        // Global affiliate settings
        Schema::create('affiliate_settings', function (Blueprint $table) {
            $table->id();
            $table->string('whatsapp_cs')->nullable()->comment('WhatsApp CS number for activation');
            $table->decimal('commission_percentage', 5, 2)->default(10.00)->comment('Commission % for affiliate');
            $table->decimal('discount_percentage', 5, 2)->default(5.00)->comment('Discount % for referral user');
            $table->decimal('min_withdrawal', 15, 2)->default(50000.00)->comment('Minimum withdrawal amount');
            $table->timestamps();
        });

        // User affiliate data
        Schema::create('user_affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('referral_code', 15)->unique()->comment('Unique referral code');
            $table->boolean('is_active')->default(false)->comment('Active status (admin must activate)');
            $table->decimal('balance', 15, 2)->default(0.00)->comment('Current available balance');
            $table->decimal('total_earned', 15, 2)->default(0.00)->comment('Total earned all time');
            $table->integer('total_referrals')->default(0)->comment('Total successful referrals');
            $table->timestamps();

            $table->index('referral_code');
            $table->index('is_active');
        });

        // Referral transactions (when someone uses referral code)
        Schema::create('referral_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained('user_affiliates')->onDelete('cascade');
            $table->foreignId('referred_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('payment_id')->nullable()->constrained('payments')->onDelete('set null');
            $table->decimal('order_amount', 15, 2)->comment('Original order amount');
            $table->decimal('discount_given', 15, 2)->comment('Discount amount given to referred user');
            $table->decimal('commission_earned', 15, 2)->comment('Commission earned by affiliate');
            $table->string('plan_name')->nullable();
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->index('affiliate_id');
            $table->index('referred_user_id');
            $table->index('status');
        });

        // Withdrawal requests
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained('user_affiliates')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->enum('payment_method', ['bank_transfer', 'dana', 'gopay', 'ovo', 'shopeepay']);
            $table->string('bank_name')->nullable()->comment('Required if payment_method is bank_transfer');
            $table->string('account_name');
            $table->string('account_number');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable()->comment('Notes from admin (especially for rejection)');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index('affiliate_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('referral_transactions');
        Schema::dropIfExists('user_affiliates');
        Schema::dropIfExists('affiliate_settings');
    }
};
