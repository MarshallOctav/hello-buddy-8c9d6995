<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // null for admin notifications
            $table->boolean('is_admin')->default(false); // true for admin panel notifications
            $table->string('type'); // withdrawal_approved, withdrawal_rejected, referral_commission, new_user, new_withdrawal
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // additional data like withdrawal_id, amount, etc.
            $table->boolean('is_read')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'is_read']);
            $table->index(['is_admin', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
