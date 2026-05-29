<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.llm.default' => 'anthropic',
        'services.llm.anthropic.key' => 'fake-anthropic-key',
        'services.llm.anthropic.model' => 'claude-sonnet-4-6',
        'services.llm.openai.key' => 'fake-openai-key',
        'services.llm.openai.model' => 'gpt-4o-mini',
        'services.llm.gemini.key' => 'fake-gemini-key',
        'services.llm.gemini.model' => 'gemini-2.5-flash',
        'services.llm.timeout' => 5,
        'services.llm.max_questions' => 20,
    ]);
});

function validQuizDraft(int $numQuestions = 2): array
{
    $questions = [];
    for ($i = 1; $i <= $numQuestions; $i++) {
        $questions[] = [
            'text' => "Pergunta {$i}",
            'points' => 1,
            'options' => [
                ['text' => 'Certa', 'is_correct' => true],
                ['text' => 'Errada', 'is_correct' => false],
            ],
        ];
    }

    return [
        'title' => 'Quiz gerado',
        'description' => 'Resumo do quiz',
        'questions' => $questions,
    ];
}

it('rejects non-teachers', function () {
    $student = User::factory()->student()->create();

    $response = $this->actingAs($student)->postJson(route('teacher.quizzes.generate'), [
        'prompt' => 'Tema qualquer com mais de 10 caracteres',
        'num_questions' => 3,
    ]);

    $response->assertStatus(302);
});

it('validates prompt and num_questions', function () {
    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->postJson(route('teacher.quizzes.generate'), [
            'prompt' => 'curto',
            'num_questions' => 3,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('prompt');

    $this->actingAs($teacher)
        ->postJson(route('teacher.quizzes.generate'), [
            'prompt' => 'Prompt aceitavel com mais de dez caracteres',
            'num_questions' => 0,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('num_questions');

    $this->actingAs($teacher)
        ->postJson(route('teacher.quizzes.generate'), [
            'prompt' => 'Prompt aceitavel com mais de dez caracteres',
            'num_questions' => 9999,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('num_questions');
});

it('returns generated quiz JSON on success with anthropic', function () {
    Http::fake([
        'api.anthropic.com/*' => Http::response([
            'content' => [
                [
                    'type' => 'tool_use',
                    'name' => 'create_quiz',
                    'input' => validQuizDraft(3),
                ],
            ],
        ], 200),
    ]);

    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->postJson(route('teacher.quizzes.generate'), [
        'prompt' => 'Gere um quiz sobre Guerra do Paraguai',
        'num_questions' => 3,
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'title',
            'description',
            'questions' => [
                '*' => [
                    'text',
                    'points',
                    'options' => [
                        '*' => ['text', 'is_correct'],
                    ],
                ],
            ],
        ]);

    expect($response->json('questions'))->toHaveCount(3);
});

it('returns 422 when LLM returns malformed payload', function () {
    Http::fake([
        'api.anthropic.com/*' => Http::response([
            'content' => [
                [
                    'type' => 'tool_use',
                    'name' => 'create_quiz',
                    'input' => [
                        'title' => 'Quebrado',
                        'description' => '',
                        'questions' => [
                            [
                                'text' => 'P1',
                                'points' => 1,
                                'options' => [
                                    ['text' => 'A', 'is_correct' => true],
                                    ['text' => 'B', 'is_correct' => true],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->postJson(route('teacher.quizzes.generate'), [
            'prompt' => 'Algum tema valido aqui',
            'num_questions' => 1,
        ])
        ->assertStatus(422);
});

it('returns 422 when LLM provider HTTP call fails', function () {
    Http::fake([
        'api.anthropic.com/*' => Http::response(['error' => 'overloaded'], 529),
    ]);

    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->postJson(route('teacher.quizzes.generate'), [
            'prompt' => 'Algum tema valido aqui',
            'num_questions' => 2,
        ])
        ->assertStatus(422);
});

it('truncates to max_questions when LLM returns too many', function () {
    config(['services.llm.max_questions' => 2]);

    Http::fake([
        'api.anthropic.com/*' => Http::response([
            'content' => [
                [
                    'type' => 'tool_use',
                    'name' => 'create_quiz',
                    'input' => validQuizDraft(5),
                ],
            ],
        ], 200),
    ]);

    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->postJson(route('teacher.quizzes.generate'), [
        'prompt' => 'Algum tema valido aqui',
        'num_questions' => 2,
    ]);

    $response->assertOk();
    expect($response->json('questions'))->toHaveCount(2);
});

it('works with openai provider', function () {
    config(['services.llm.default' => 'openai']);

    Http::fake([
        'api.openai.com/*' => Http::response([
            'choices' => [[
                'message' => [
                    'content' => json_encode(validQuizDraft(2)),
                ],
            ]],
        ], 200),
    ]);

    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->postJson(route('teacher.quizzes.generate'), [
        'prompt' => 'Quiz sobre fotossintese',
        'num_questions' => 2,
    ]);

    $response->assertOk();
    expect($response->json('questions'))->toHaveCount(2);
});

it('works with gemini provider', function () {
    config(['services.llm.default' => 'gemini']);

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => [
                    'parts' => [
                        ['text' => json_encode(validQuizDraft(2))],
                    ],
                ],
            ]],
        ], 200),
    ]);

    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->postJson(route('teacher.quizzes.generate'), [
        'prompt' => 'Quiz sobre frações',
        'num_questions' => 2,
    ]);

    $response->assertOk();
    expect($response->json('questions'))->toHaveCount(2);
});
