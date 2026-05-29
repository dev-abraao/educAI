<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class GenerateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isTeacher() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $max = (int) config('services.llm.max_questions', 20);

        return [
            'prompt' => ['nullable', 'string', 'min:10', 'max:2000', 'required_without:file'],
            'num_questions' => ['required', 'integer', 'min:1', 'max:'.$max],
            'file' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:20480',
                function (string $attribute, $value, $fail): void {
                    if (! $value instanceof \Illuminate\Http\UploadedFile) {
                        return;
                    }

                    $path = $value->getPathname();
                    $handle = @fopen($path, 'rb');
                    if (!$handle) {
                        $fail('Nao foi possivel ler o arquivo enviado.');

                        return;
                    }

                    $header = fread($handle, 5) ?: '';
                    fclose($handle);

                    if ($header !== '%PDF-') {
                        $fail('O arquivo enviado nao parece ser um PDF valido.');
                    }
                },
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'prompt.required_without' => 'Descreva o quiz ou envie um PDF.',
            'prompt.min' => 'O prompt esta muito curto, escreva pelo menos 10 caracteres.',
            'prompt.max' => 'O prompt esta muito longo (limite de 2000 caracteres).',
            'num_questions.required' => 'Informe quantas questoes deseja gerar.',
            'num_questions.min' => 'Voce precisa pedir pelo menos 1 questao.',
            'num_questions.max' => 'Numero de questoes acima do limite permitido.',
            'file.mimes' => 'O arquivo precisa estar em formato PDF.',
            'file.max' => 'O PDF ultrapassa o limite de tamanho permitido.',
        ];
    }
}
