<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index()
    {
        $reservations = Reservation::with(['user', 'vehicle'])->latest()->get();

        return response()->json($reservations->map(function ($r) {
            return [
                'id'           => $r->id,
                'user_id'      => $r->user_id,
                'vehicle_id'   => $r->vehicle_id,
                'client_name'  => $r->user?->name ?? '-',
                'vehicle_name' => $r->vehicle?->name ?? '-',
                'start_date'   => $r->start_date,
                'end_date'     => $r->end_date,
                'total_days'   => $r->total_days,
                'total_value'  => $r->total_value,
                'status'       => $r->status,
                'notes'        => $r->notes,
                'created_at'   => $r->created_at,
            ];
        }));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id'    => 'required|exists:users,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after:start_date',
        ], [
            'user_id.required'      => 'Usuário é obrigatório.',
            'user_id.exists'        => 'Usuário não encontrado.',
            'vehicle_id.required'   => 'Veículo é obrigatório.',
            'vehicle_id.exists'     => 'Veículo não encontrado.',
            'start_date.required'   => 'Data de retirada é obrigatória.',
            'start_date.after_or_equal' => 'A retirada não pode ser no passado.',
            'end_date.required'     => 'Data de devolução é obrigatória.',
            'end_date.after'        => 'A devolução deve ser após a retirada.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $vehicle = Vehicle::find($request->vehicle_id);

        if (!$vehicle->available) {
            return response()->json(['error' => 'Veículo não está disponível para reserva.'], 422);
        }

        $start      = Carbon::parse($request->start_date);
        $end        = Carbon::parse($request->end_date);
        $totalDays  = $start->diffInDays($end);
        $totalValue = $totalDays * $vehicle->price_per_day;

        $reservation = Reservation::create([
            'user_id'     => $request->user_id,
            'vehicle_id'  => $request->vehicle_id,
            'start_date'  => $request->start_date,
            'end_date'    => $request->end_date,
            'total_days'  => $totalDays,
            'total_value' => $totalValue,
            'status'      => 'pendente',
            'notes'       => $request->notes,
        ]);

        return response()->json([
            'id'          => $reservation->id,
            'vehicle_name'=> $vehicle->name,
            'start_date'  => $reservation->start_date,
            'end_date'    => $reservation->end_date,
            'total_days'  => $reservation->total_days,
            'total_value' => $reservation->total_value,
            'status'      => $reservation->status,
        ], 201);
    }

    public function byUser($userId)
    {
        $reservations = Reservation::with('vehicle')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        return response()->json($reservations->map(function ($r) {
            return [
                'id'           => $r->id,
                'vehicle_name' => $r->vehicle?->name ?? '-',
                'start_date'   => $r->start_date,
                'end_date'     => $r->end_date,
                'total_days'   => $r->total_days,
                'total_value'  => $r->total_value,
                'status'       => $r->status,
            ];
        }));
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pendente,confirmada,em_andamento,concluida,cancelada',
        ], [
            'status.required' => 'O status é obrigatório.',
            'status.in'       => 'Status inválido.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['error' => 'Reserva não encontrada.'], 404);
        }

        $reservation->status = $request->status;
        $reservation->save();

        if ($request->status === 'confirmada') {
            Vehicle::where('id', $reservation->vehicle_id)->update(['available' => false]);
        }

        if (in_array($request->status, ['concluida', 'cancelada'])) {
            Vehicle::where('id', $reservation->vehicle_id)->update(['available' => true]);
        }

        return response()->json($reservation);
    }

    public function destroy($id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['error' => 'Reserva não encontrada.'], 404);
        }

        $reservation->delete();

        return response()->json(['message' => 'Reserva excluída com sucesso.']);
    }
}