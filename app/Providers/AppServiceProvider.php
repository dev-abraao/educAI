<?php

namespace App\Providers;

use App\Services\Llm\AnthropicProvider;
use App\Services\Llm\GeminiProvider;
use App\Services\Llm\LlmProvider;
use App\Services\Llm\OpenAIProvider;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(LlmProvider::class, function ($app): LlmProvider {
            return match (config('services.llm.default')) {
                'anthropic' => $app->make(AnthropicProvider::class),
                'openai' => $app->make(OpenAIProvider::class),
                'gemini' => $app->make(GeminiProvider::class),
                default => throw new RuntimeException(
                    'LLM provider inválido. Defina LLM_PROVIDER=anthropic|openai|gemini.'
                ),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
