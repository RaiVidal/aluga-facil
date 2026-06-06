<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::create('contracts', function (Blueprint $table) {
        $table->id();
        $table->string('client_name');  // Nome do cliente associado ao contrato
        $table->string('vehicle_name'); // Nome do veículo alugado
        $table->string('status')->default('Ativo'); // Status padrão do contrato
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
