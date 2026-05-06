<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreQuizRequest;
use App\Models\Quiz;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    public function store(StoreQuizRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $request): void {
            $quiz = Quiz::create([
                'class_id' => $data['class_id'],
                'teacher_id' => $request->user()?->id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'opens_at' => $data['opens_at'],
                'closes_at' => $data['closes_at'],
                'duration_minutes' => $data['duration_minutes'],
            ]);

            foreach ($data['questions'] as $index => $questionData) {
                $question = $quiz->questions()->create([
                    'question_text' => $questionData['text'],
                    'position' => $index + 1,
                    'points' => $questionData['points'] ?? 1,
                ]);

                foreach ($questionData['options'] as $optionIndex => $optionData) {
                    $question->options()->create([
                        'option_text' => $optionData['text'],
                        'is_correct' => (bool) ($optionData['is_correct'] ?? false),
                        'position' => $optionIndex + 1,
                    ]);
                }
            }
        });

        return back()->with('status', 'Quiz created successfully.');
    }
}
