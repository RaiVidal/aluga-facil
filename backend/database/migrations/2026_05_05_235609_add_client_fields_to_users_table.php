<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('cliente')->after('password');
            }

            if (!Schema::hasColumn('users', 'cpf')) {
                $table->string('cpf')->nullable()->after('role');
            }

            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('cpf');
            }

            if (!Schema::hasColumn('users', 'cnh')) {
                $table->string('cnh')->nullable()->after('phone');
            }

            if (!Schema::hasColumn('users', 'cnh_category')) {
                $table->string('cnh_category')->nullable()->after('cnh');
            }
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