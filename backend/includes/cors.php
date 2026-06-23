<?php

// Prevent warnings when run from CLI
$method = $_SERVER['REQUEST_METHOD'] ?? null;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($method === "OPTIONS") {
    http_response_code(200);
    exit();
}
