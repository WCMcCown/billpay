<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../config/database.php";

try {
    if (!isset($_GET["item_id"])) {
        throw new Exception("Missing item_id");
    }

    $db = new Database();
    $pdo = $db->pdo;

    $stmt = $pdo->prepare("SELECT * FROM payments WHERE item_id = ? ORDER BY paid_at DESC");
    $stmt->execute([$_GET["item_id"]]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
