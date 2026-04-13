<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
	Route::inertia('/', 'welcome')->name('landing');
	Route::redirect('/login', '/')->name('login');
	Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
	Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
});

Route::middleware('auth')->group(function (): void {
	Route::inertia('/home', 'home')->name('home');

	Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
});
