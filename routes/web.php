<?php

use App\Http\Controllers\Admin\ClassManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Student\StudentClassJoinController;
use App\Http\Controllers\Student\StudentDashboardController;
use App\Http\Controllers\Student\StudentQuizController;
use App\Http\Controllers\Teacher\AiQuizController;
use App\Http\Controllers\Teacher\QuizController as TeacherQuizController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
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

	Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function (): void {
		Route::get('/dashboard', [UserManagementController::class, 'index'])->name('dashboard');
		Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
		Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
		Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
		Route::post('/classes', [ClassManagementController::class, 'store'])->name('classes.store');
		Route::delete('/classes/{class}', [ClassManagementController::class, 'destroy'])->name('classes.destroy');
	});

	Route::middleware('role:teacher')->prefix('teacher')->name('teacher.')->group(function (): void {
		Route::get('/dashboard', TeacherDashboardController::class)->name('dashboard');
		Route::post('/quizzes', [TeacherQuizController::class, 'store'])->name('quizzes.store');
		Route::post('/quizzes/generate', [AiQuizController::class, 'generate'])->name('quizzes.generate');
	});

	Route::middleware('role:student')->prefix('student')->name('student.')->group(function (): void {
		Route::get('/dashboard', StudentDashboardController::class)->name('dashboard');
		Route::get('/quizzes/{quiz}', [StudentQuizController::class, 'show'])->name('quizzes.show');
		Route::post('/quizzes/{quiz}/start', [StudentQuizController::class, 'start'])->name('quizzes.start');
		Route::post('/quizzes/{quiz}/submit', [StudentQuizController::class, 'submit'])->name('quizzes.submit');
		Route::get('/classes/join/{code}', [StudentClassJoinController::class, 'show'])->name('classes.join.show');
		Route::post('/classes/join/{code}', [StudentClassJoinController::class, 'store'])->name('classes.join.store');
	});

	Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
});