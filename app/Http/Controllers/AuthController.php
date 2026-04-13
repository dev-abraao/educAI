<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): RedirectResponse
    {
        $user = User::create($request->registrationData());

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(route('home'));
    }

    /**
     * @throws ValidationException
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        if (!Auth::attempt($request->credentials(), true)) {
            return back()->withErrors([
                'email' => 'The credentials do not match our records.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('home'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('landing');
    }
}
