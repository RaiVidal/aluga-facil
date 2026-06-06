<?php

namespace App\Http\Controllers;

use App\Models\BudgetRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BudgetRequestController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:100',
            'phone'      => 'required|string|max:20',
            'vehicle'    => 'required|string|max:100',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after:start_date',
        ], [
            'name.required'       => 'O nome é obrigatório.',
            'phone.required'      => 'O telefone é obrigatório.',
            'vehicle.required'    => 'Informe o veículo desejado.',
            'start_date.required' => 'A data de retirada é obrigatória.',
            'end_date.required'   => 'A data de devolução é obrigatória.',
            'end_date.after'      => 'A devolução deve ser após a retirada.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $budget = BudgetRequest::create([
            'user_id'    => $request->user_id,
            'name'       => $request->name,
            'phone'      => $request->phone,
            'vehicle'    => $request->vehicle,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'message'    => $request->message,
            'status'     => 'pendente',
        ]);

        return response()->json($budget, 201);
    }

    public function index()
    {
        return response()->json(BudgetRequest::latest()->get());
    }

    public function byUser($userId)
    {
        return response()->json(
            BudgetRequest::where('user_id', $userId)->latest()->get()
        );
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pendente,em_analise,aprovado,rejeitado,concluido',
        ], [
            'status.required' => 'O status é obrigatório.',
            'status.in'       => 'Status inválido.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $budget = BudgetRequest::find($id);

        if (!$budget) {
            return response()->json(['error' => 'Solicitação não encontrada.'], 404);
        }

        $budget->status = $request->status;
        $budget->save();

        return response()->json($budget);
    }
}