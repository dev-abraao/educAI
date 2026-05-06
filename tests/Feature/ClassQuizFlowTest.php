<?php

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Support\Str;

if (! in_array('sqlite', \PDO::getAvailableDrivers(), true)) {
    test('class and quiz flow tests require sqlite driver', function () {
        expect(true)->toBeTrue();
    })->skip('pdo_sqlite is not installed in this environment.');

    return;
}

it('allows admin to create classes', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($admin)->post(route('admin.classes.store'), [
        'name' => 'Turma 1',
        'teacher_id' => $teacher->id,
        'active' => true,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('classes', [
        'name' => 'Turma 1',
        'teacher_id' => $teacher->id,
    ]);
});

it('allows students to join classes via invite link', function () {
    $student = User::factory()->student()->create();

    $class = SchoolClass::create([
        'name' => 'Turma de Ciencias',
        'active' => true,
        'invite_code' => Str::upper(Str::random(8)),
    ]);

    $response = $this->actingAs($student)->post(route('student.classes.join.store', $class->invite_code));

    $response->assertRedirect(route('student.dashboard'));

    $this->assertDatabaseHas('class_student', [
        'class_id' => $class->id,
        'student_id' => $student->id,
    ]);
});

it('allows teachers to create quizzes for their classes', function () {
    $teacher = User::factory()->teacher()->create();

    $class = SchoolClass::create([
        'name' => 'Turma de Historia',
        'active' => true,
        'invite_code' => Str::upper(Str::random(8)),
        'teacher_id' => $teacher->id,
    ]);

    $payload = [
        'class_id' => $class->id,
        'title' => 'Quiz da Semana',
        'opens_at' => now()->subMinute()->toDateTimeString(),
        'closes_at' => now()->addHour()->toDateTimeString(),
        'duration_minutes' => 15,
        'questions' => [
            [
                'text' => 'Pergunta 1',
                'points' => 2,
                'options' => [
                    ['text' => 'A', 'is_correct' => true],
                    ['text' => 'B', 'is_correct' => false],
                ],
            ],
        ],
    ];

    $response = $this->actingAs($teacher)->post(route('teacher.quizzes.store'), $payload);

    $response->assertRedirect();

    $this->assertDatabaseHas('quizzes', [
        'class_id' => $class->id,
        'title' => 'Quiz da Semana',
    ]);
});

it('scores student attempts when submitting quizzes', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();

    $class = SchoolClass::create([
        'name' => 'Turma de Matematica',
        'active' => true,
        'invite_code' => Str::upper(Str::random(8)),
        'teacher_id' => $teacher->id,
    ]);

    $student->classes()->attach($class->id);

    $quiz = Quiz::create([
        'class_id' => $class->id,
        'teacher_id' => $teacher->id,
        'title' => 'Quiz de Algebra',
        'opens_at' => now()->subMinute(),
        'closes_at' => now()->addHour(),
        'duration_minutes' => 10,
    ]);

    $questionOne = QuizQuestion::create([
        'quiz_id' => $quiz->id,
        'question_text' => 'Quanto e 2+2?',
        'position' => 1,
        'points' => 2,
    ]);

    $questionTwo = QuizQuestion::create([
        'quiz_id' => $quiz->id,
        'question_text' => 'Quanto e 3+3?',
        'position' => 2,
        'points' => 1,
    ]);

    $correctOne = QuizOption::create([
        'question_id' => $questionOne->id,
        'option_text' => '4',
        'is_correct' => true,
        'position' => 1,
    ]);

    $wrongOne = QuizOption::create([
        'question_id' => $questionOne->id,
        'option_text' => '5',
        'is_correct' => false,
        'position' => 2,
    ]);

    QuizOption::create([
        'question_id' => $questionTwo->id,
        'option_text' => '6',
        'is_correct' => true,
        'position' => 1,
    ]);

    $wrongTwo = QuizOption::create([
        'question_id' => $questionTwo->id,
        'option_text' => '9',
        'is_correct' => false,
        'position' => 2,
    ]);

    $startResponse = $this->actingAs($student)->post(route('student.quizzes.start', $quiz));

    $startResponse->assertRedirect(route('student.quizzes.show', $quiz));

    $submitResponse = $this->actingAs($student)->post(route('student.quizzes.submit', $quiz), [
        'answers' => [
            ['question_id' => $questionOne->id, 'option_id' => $correctOne->id],
            ['question_id' => $questionTwo->id, 'option_id' => $wrongTwo->id],
        ],
    ]);

    $submitResponse->assertRedirect(route('student.quizzes.show', $quiz));

    $attempt = QuizAttempt::query()
        ->where('quiz_id', $quiz->id)
        ->where('student_id', $student->id)
        ->firstOrFail();

    expect($attempt->score)->toBe(2);
    expect($attempt->max_score)->toBe(3);
});
