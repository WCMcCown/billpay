<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . "/../includes/cors.php";
require_once "../config/database.php";

try {
    $db = new Database();
    $pdo = $db->pdo;

    $stmt = $pdo->query("SELECT * FROM amortization ORDER BY id ASC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($rows);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
