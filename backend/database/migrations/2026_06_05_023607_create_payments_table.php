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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');    // Nome do cliente que efetuou o pagamento
            $table->string('method');         // Método: Pix, Cartão ou Boleto
            $table->decimal('amount', 10, 2); // Valor da transação financeira
            $table->string('status')->default('Pago'); // Estado: Pago ou Pendente
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};