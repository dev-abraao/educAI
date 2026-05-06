<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'quiz_id',
    'question_text',
    'position',
    'points',
])]
class QuizQuestion extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'points' => 'integer',
        ];
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuizOption::class, 'question_id');
    }
}
