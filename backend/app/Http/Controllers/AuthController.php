<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\BudgetRequest;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->merge([
            'cpf'   => preg_replace('/\D/', '', $request->cpf),
            'phone' => preg_replace('/\D/', '', $request->phone),
            'cnh'   => preg_replace('/\D/', '', $request->cnh),
        ]);
        
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:100',
            'email'        => 'required|email|unique:users,email',
            'password'     => ['required', 'string', 'min:6', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
            'cpf'          => 'required|string|size:11',
            'phone'        => 'required|string|min:10|max:11',
            'cnh'          => 'required|string|size:11',
            'cnh_category' => 'required|in:B,C,D',
        ], [
            'password.regex' => 'A senha deve conter letras e números.',
            'cpf.size'       => 'O CPF deve conter 11 números.',
            'phone.min'      => 'O telefone deve conter DDD e número.',
            'cnh.size'       => 'A CNH deve conter 11 números.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'         => $request->name,
            'cpf'          => $request->cpf,
            'email'        => $request->email,
            'phone'        => $request->phone,
            'cnh'          => $request->cnh,
            'cnh_category' => $request->cnh_category,
            'password' => $request->password,
            'role'         => $request->role ?? 'cliente',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Conta criada com sucesso.',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required'    => 'O e-mail é obrigatório.',
            'email.email'       => 'Informe um e-mail válido.',
            'password.required' => 'A senha é obrigatória.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'E-mail ou senha inválidos.'
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    public function adminStats()
    {
        return response()->json([
            'vehicles_total'         => Vehicle::count(),
            'vehicles_available'     => Vehicle::where('available', true)->count(),
            'vehicles_unavailable'   => Vehicle::where('available', false)->count(),
            'clients_total'          => User::where('role', 'cliente')->count(),
            'budget_requests_total'  => BudgetRequest::count(),
            'reservations_total'     => Reservation::count(),
            'budget_requests_recent' => BudgetRequest::latest()->take(5)->get(),
        ]);
    }
}   