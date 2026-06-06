<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function index()
    {
        // Puxa todos os registros da tabela 'contracts' e retorna status 200 (sucesso)
        return response()->json(Contract::all(), 200);
    }
}