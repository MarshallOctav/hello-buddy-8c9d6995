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
        Schema::create('test_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('test_id'); // ID tes dari frontend (e.g., 'financial-health')
            $table->string('test_title');
            $table->string('category');
            $table->integer('score'); // Persentase 0-100
            $table->string('level'); // Low, Medium, High, Expert
            $table->integer('xp_earned')->default(0);
            $table->json('answers')->nullable(); // Menyimpan jawaban detail
            $table->json('dimension_scores')->nullable(); // Skor per dimensi
            $table->timestamps();
            
            // Index untuk query yang sering digunakan
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'test_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_results');
    }
};
