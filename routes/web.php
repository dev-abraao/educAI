<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\AuthController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
	Route::inertia('/', 'welcome')->name('landing');
	Route::redirect('/login', '/')->name('login');
	Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
});

Route::middleware('auth')->group(function (): void {
	Route::get('/home', function (Request $request) {
		/** @var User $user */
		$user = $request->user();

		return redirect()->route(match ($user->role->value) {
			'admin' => 'admin.dashboard',
			'teacher' => 'teacher.dashboard',
			default => 'student.dashboard',
		});
	})->name('home');

	Route::inertia('/teacher/dashboard', 'teacher/dashboard')->middleware('role:teacher')->name('teacher.dashboard');
	Route::inertia('/student/dashboard', 'student/dashboard')->middleware('role:student')->name('student.dashboard');

	Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function (): void {
		Route::get('/dashboard', [UserManagementController::class, 'index'])->name('dashboard');
		Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
		Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
		Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
	});

	Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
});
