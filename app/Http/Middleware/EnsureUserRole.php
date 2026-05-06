<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * @param  array<int, string>  $roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        if (! in_array((string) $user->role->value, $roles, true)) {
            $roleLabel = match ($user->role->value) {
                'teacher' => 'professor',
                'student' => 'aluno',
                'admin'   => 'administrador',
                default   => $user->role->value,
            };

            $requiredLabel = match (true) {
                in_array('student', $roles, true) => 'alunos',
                in_array('teacher', $roles, true) => 'professores',
                in_array('admin', $roles, true)   => 'administradores',
                default                           => implode(', ', $roles),
            };

            return redirect()->back()->withFallback(route('home'))
                ->with('error', "Esta área é restrita a {$requiredLabel}. Você está logado como {$roleLabel}.");
        }

        return $next($request);
    }
}
