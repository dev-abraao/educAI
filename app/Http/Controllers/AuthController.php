<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request): RedirectResponse
    {
        if (!Auth::attempt($request->credentials(), true)) {
            return back()->withErrors([
                'email' => 'The credentials do not match our records.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        $destination = match ($request->user()?->role) {
            UserRole::ADMIN => route('admin.dashboard'),
            UserRole::TEACHER => route('teacher.dashboard'),
            UserRole::STUDENT => route('student.dashboard'),
            default => route('landing'),
        };

        return redirect()->intended($destination);
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('landing');
    }
}
