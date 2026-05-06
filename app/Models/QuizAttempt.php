<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'quiz_id',
    'student_id',
    'started_at',
    'due_at',
    'submitted_at',
    'score',
    'max_score',
])]
class QuizAttempt extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'due_at' => 'datetime',
            'submitted_at' => 'datetime',
            'score' => 'integer',
            'max_score' => 'integer',
        ];
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class, 'attempt_id');
    }
}
