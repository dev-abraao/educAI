<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Prompt de Geração de Quiz por IA
    |--------------------------------------------------------------------------
    | Centralizado aqui para facilitar ajustes sem tocar no controller.
    | Versão 1.0 — variáveis: :count, :topic, :level
    */

    'quiz_prompt' => 'Você é um assistente pedagógico especializado em avaliações. Gere :count questões de múltipla escolha sobre o tema ":topic" adequadas para o nível ":level". Responda apenas com JSON válido, sem explicações, sem markdown, sem texto fora do JSON. Use exatamente este formato: {"questions":[{"text":"enunciado da questão","options":[{"text":"alternativa","is_correct":true},{"text":"alternativa","is_correct":false},{"text":"alternativa","is_correct":false},{"text":"alternativa","is_correct":false}]}]}. Cada questão deve ter exatamente 4 alternativas e somente uma marcada como is_correct true.',

];