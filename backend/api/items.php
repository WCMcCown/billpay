<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/database.php";

try {
    $db = new Database();
    $pdo = $db->connect();

    $stmt = $pdo->query("SELECT * FROM items ORDER BY due_date ASC");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($items);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
