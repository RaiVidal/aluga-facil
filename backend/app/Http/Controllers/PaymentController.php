<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Retorna a lista de pagamentos em formato JSON para o painel.
     */
    public function index()
    {
        // Puxa todos os registros financeiros salvos na tabela 'payments'
        $pagamentos = Payment::all();
        
        // Retorna a resposta para o JavaScript com o status 200 (Sucesso)
        return response()->json($pagamentos, 200);
    }
}