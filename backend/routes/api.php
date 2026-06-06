<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\BudgetRequestController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\PaymentController;

Route::get('/payments', [PaymentController::class, 'index']);

Route::get('/contracts', [ContractController::class, 'index']);

// Auth
Route::post('/register',        [AuthController::class, 'register']);
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/logout',          [AuthController::class, 'logout']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password',  [PasswordResetController::class, 'resetPassword']);

// Admin stats
Route::get('/admin/stats', [AuthController::class, 'adminStats']);

// Veículos
Route::get('/vehicles',          [VehicleController::class, 'index']);
Route::get('/vehicles/{id}',     [VehicleController::class, 'show']);
Route::post('/vehicles',         [VehicleController::class, 'store']);
Route::post('/vehicles/{id}',    [VehicleController::class, 'update']);
Route::put('/vehicles/{id}',     [VehicleController::class, 'update']);
Route::delete('/vehicles/{id}',  [VehicleController::class, 'destroy']);

// Orçamentos
Route::post('/budget-requests',              [BudgetRequestController::class, 'store']);
Route::get('/budget-requests',               [BudgetRequestController::class, 'index']);
Route::get('/budget-requests/user/{userId}', [BudgetRequestController::class, 'byUser']);
Route::put('/budget-requests/{id}/status',   [BudgetRequestController::class, 'updateStatus']);

// Reservas
Route::get('/reservations',                    [ReservationController::class, 'index']);
Route::post('/reservations',                   [ReservationController::class, 'store']);
Route::get('/reservations/user/{userId}',      [ReservationController::class, 'byUser']);
Route::put('/reservations/{id}/status',        [ReservationController::class, 'updateStatus']);
Route::delete('/reservations/{id}',            [ReservationController::class, 'destroy']);

// Usuários (admin)
Route::get('/users',      [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);