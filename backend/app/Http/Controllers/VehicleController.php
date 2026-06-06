<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    public function index()
    {
        return response()->json(Vehicle::latest()->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'          => 'required|string|max:100',
            'brand'         => 'required|string|max:60',
            'model'         => 'required|string|max:60',
            'year'          => 'required|integer|min:1990|max:2030',
            'price_per_day' => 'required|numeric|min:1',
            'description'   => 'nullable|string',
            'image'         => 'nullable|image|max:4096',
        ], [
            'name.required'          => 'O nome do veículo é obrigatório.',
            'brand.required'         => 'A marca é obrigatória.',
            'model.required'         => 'O modelo é obrigatório.',
            'year.required'          => 'O ano é obrigatório.',
            'year.integer'           => 'O ano deve ser um número.',
            'price_per_day.required' => 'O valor da diária é obrigatório.',
            'price_per_day.numeric'  => 'O valor da diária deve ser um número.',
            'image.image'            => 'O arquivo deve ser uma imagem.',
            'image.max'              => 'A imagem deve ter no máximo 4MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('vehicles', 'public');
        }

        $vehicle = Vehicle::create([
            'name'          => $request->name,
            'brand'         => $request->brand,
            'model'         => $request->model,
            'year'          => $request->year,
            'price_per_day' => $request->price_per_day,
            'image'         => $imagePath,
            'description'   => $request->description,
            'available'     => $request->available ?? true,
        ]);

        return response()->json($vehicle, 201);
    }

    public function show($id)
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json(['error' => 'Veículo não encontrado.'], 404);
        }

        return response()->json($vehicle);
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json(['error' => 'Veículo não encontrado.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'          => 'required|string|max:100',
            'brand'         => 'required|string|max:60',
            'model'         => 'required|string|max:60',
            'year'          => 'required|integer|min:1990|max:2030',
            'price_per_day' => 'required|numeric|min:1',
            'image'         => 'nullable|image|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        if ($request->hasFile('image')) {
            if ($vehicle->image && Storage::disk('public')->exists($vehicle->image)) {
                Storage::disk('public')->delete($vehicle->image);
            }
            $vehicle->image = $request->file('image')->store('vehicles', 'public');
        }

        $vehicle->name          = $request->name;
        $vehicle->brand         = $request->brand;
        $vehicle->model         = $request->model;
        $vehicle->year          = $request->year;
        $vehicle->price_per_day = $request->price_per_day;
        $vehicle->description   = $request->description;
        $vehicle->available     = filter_var($request->available, FILTER_VALIDATE_BOOLEAN);
        $vehicle->save();

        return response()->json($vehicle);
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json(['error' => 'Veículo não encontrado.'], 404);
        }

        if ($vehicle->image && Storage::disk('public')->exists($vehicle->image)) {
            Storage::disk('public')->delete($vehicle->image);
        }

        $vehicle->delete();

        return response()->json(['message' => 'Veículo excluído com sucesso.']);
    }
}