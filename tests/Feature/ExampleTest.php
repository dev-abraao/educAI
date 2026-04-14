<?php

test('returns a successful response', function () {
    $this->withoutVite();

    $response = $this->get(route('landing'));

    $response->assertOk();
});

test('redirects guest users away from home', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});