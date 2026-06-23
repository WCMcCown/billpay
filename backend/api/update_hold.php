<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

require_once __DIR__ . "/../includes/cors.php";
require_once "../config/database.php";

try {
    $db = new Database();
    $pdo = $db->pdo;

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["id"]) || !isset($data["hold_amount"])) {
        throw new Exception("Missing required fields");
    }

    $stmt = $pdo->prepare("UPDATE items SET hold_amount = ? WHERE id = ?");
    $stmt->execute([$data["hold_amount"], $data["id"]]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
