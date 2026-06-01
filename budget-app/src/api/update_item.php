<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

require_once "../config/database.php";

try {
    $db = new Database();
    $pdo = $db->pdo;

    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("
        UPDATE items 
        SET name = ?, due_date = ?, amount = ?, hold_amount = ?, apr = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $data["name"],
        $data["due_date"],
        $data["amount"],
        $data["hold_amount"],
        $data["apr"],
        $data["id"]
    ]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
