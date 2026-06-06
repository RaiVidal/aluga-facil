<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('cliente')->after('password');
            $table->string('cpf')->nullable()->after('role');
            $table->string('phone')->nullable()->after('cpf');
            $table->string('cnh')->nullable()->after('phone');
            $table->string('cnh_category')->nullable()->after('cnh');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'cpf',
                'phone',
                'cnh',
                'cnh_category',
            ]);
        });
    }
};