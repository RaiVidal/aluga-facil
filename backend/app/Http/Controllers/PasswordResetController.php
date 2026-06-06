<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
{
    if (empty($request->email)) {
        return response()->json(['message' => 'Informe o e-mail.'], 422);
    }

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json([
            'message' => 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.'
        ]);
    }

    $token = Str::random(64);

    DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $request->email],
        [
            'token'      => Hash::make($token),
            'created_at' => now(),
        ]
    );

    $resetLink = env('FRONTEND_URL', 'http://127.0.0.1:5500')
        . '/pages/nova-senha.html?token=' . $token . '&email=' . urlencode($request->email);

    try {
        Mail::raw(
            "Olá, {$user->name}!\n\nClique no link abaixo para redefinir sua senha:\n\n{$resetLink}\n\nEste link expira em 60 minutos.\n\nSe não foi você, ignore este e-mail.",
            function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Redefinição de senha — Aluga Fácil');
            }
        );
    } catch (\Exception $e) {
        // Mail não configurado ainda — retorna o link no response para testes locais
        return response()->json([
            'message'    => 'E-mail não configurado. Use o link abaixo para testar localmente:',
            'reset_link' => $resetLink,
        ]);
    }

    return response()->json([
        'message' => 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.'
    ]);
}

    public function resetPassword(Request $request)
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token inválido ou expirado.'], 422);
        }

        // Token expira em 60 minutos
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Token expirado. Solicite um novo link.'], 422);
        }

        if (strlen($request->password) < 6) {
            return response()->json(['message' => 'A senha deve ter pelo menos 6 caracteres.'], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuário não encontrado.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Senha redefinida com sucesso!']);
    }
}