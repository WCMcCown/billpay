<?php
ob_clean();
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");


require_once "../config/database.php";

try {
    $db = new Database();
    $pdo = $db->pdo;

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit;
    }

    // -------------------------
    // GET — Fetch all bills for a user
    // -------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;

        if (!$user_id) {
            echo json_encode(["success" => false, "message" => "Missing user_id"]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM bills WHERE user_id = ? ORDER BY due_day ASC");
        $stmt->execute([$user_id]);
        $bills = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "bills" => $bills]);
        exit;
    }

    // -------------------------
    // POST — Add a new bill
    // -------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        $required = ['user_id','name','amount','due_day','type'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                echo json_encode(["success" => false, "message" => "Missing field: $field"]);
                exit;
            }
        }

        $stmt = $pdo->prepare("
            INSERT INTO bills 
            (user_id, name, amount, due_day, type, frequency, hold_amount, autopay, link, apr, remaining, category, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $success = $stmt->execute([
            $data['user_id'],
            $data['name'],
            $data['amount'],
            $data['due_day'],
            $data['type'],
            $data['frequency'] ?? 1,
            $data['hold_amount'] ?? 0,
            !empty($data['autopay']) ? 1 : 0,
            $data['link'] ?? null,
            $data['apr'] ?? 0,
            $data['remaining'] ?? $data['amount'],
            $data['category'] ?? null,
            $data['notes'] ?? null
        ]);

        $stmt->execute();

        $newId = $pdo->lastInsertId();

        // Fetch the newly created bill
        $query = "SELECT * FROM bills WHERE id = :id LIMIT 1";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(":id", $newId);
        $stmt->execute();
        $newBill = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "bill" => $newBill
        ]);
        exit;

    }

    // -------------------------
    // PUT — Update a bill
    // -------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            echo json_encode(["success" => false, "message" => "Missing bill id"]);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE bills SET 
                name = ?, amount = ?, due_day = ?, type = ?, frequency = ?, hold_amount = ?, 
                autopay = ?, link = ?, apr = ?, remaining = ?, category = ?, notes = ?
            WHERE id = ? AND user_id = ?
        ");

        $success = $stmt->execute([
            $data['name'],
            $data['amount'],
            $data['due_day'],
            $data['type'],
            $data['frequency'],
            $data['hold_amount'],
            !empty($data['autopay']) ? 1 : 0,
            $data['link'],
            $data['apr'],
            $data['remaining'],
            $data['category'],
            $data['notes'],
            $data['id'],
            $data['user_id']
        ]);

        $stmt->execute();

        // Fetch updated bill
        $query = "SELECT * FROM bills WHERE id = :id LIMIT 1";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(":id", $data['id']);
        $stmt->execute();
        $updatedBill = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "bill" => $updatedBill
        ]);
        exit;
    }

    // -------------------------
    // DELETE — Remove a bill
    // -------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id']) || empty($data['user_id'])) {
            echo json_encode(["success" => false, "message" => "Missing id or user_id"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM bills WHERE id = ? AND user_id = ?");
        $success = $stmt->execute([$data['id'], $data['user_id']]);

        echo json_encode(["success" => $success]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
ob_end_flush();