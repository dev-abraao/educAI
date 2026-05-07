<?php

use App\Models\User;

it('allows admin users to access the admin dashboard', function () {
    $this->withoutVite();

    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk();
});

it('forbids non-admin users from admin dashboard', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->get(route('admin.dashboard'));

    $response->assertRedirect();
});

it('allows admin users to create teacher and student users', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Managed Teacher',
        'email' => 'managed.teacher@example.com',
        'role' => 'teacher',
        'password' => 'Password!123',
        'password_confirmation' => 'Password!123',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('users', [
        'email' => 'managed.teacher@example.com',
        'role' => 'teacher',
    ]);
});

it('blocks admin users from creating admin users through dashboard', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Another Admin',
        'email' => 'another.admin@example.com',
        'role' => 'admin',
        'password' => 'Password!123',
        'password_confirmation' => 'Password!123',
    ]);

    $response->assertSessionHasErrors('role');

    $this->assertDatabaseMissing('users', [
        'email' => 'another.admin@example.com',
    ]);
});
