<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json");


require_once "../config/database.php";

$method = $_SERVER['REQUEST_METHOD'];

// Handle CORS preflight
if ($method === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Connect using PDO
try {
    $db = new Database();
    $pdo = $db->pdo;
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

switch ($method) {

    /* ---------------------------------------------------------
       GET — List all upcoming expenses for a user
    --------------------------------------------------------- */
    case "GET":
        if (!isset($_GET['user_id'])) {
            echo json_encode(["success" => false, "message" => "Missing user_id"]);
            exit();
        }

        $user_id = intval($_GET['user_id']);

        $query = "SELECT * FROM upcoming_expenses 
                  WHERE user_id = :user_id 
                  ORDER BY 
                    CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
                    due_date ASC";

        $stmt = $pdo->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "expenses" => $expenses]);
        break;


    /* ---------------------------------------------------------
       POST — Create a new upcoming expense
    --------------------------------------------------------- */
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['user_id']) || !isset($data['name']) || !isset($data['amount'])) {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
            exit();
        }

        $user_id = intval($data['user_id']);
        $name = $data['name'];
        $amount = floatval($data['amount']);
        $hold_amount = isset($data['hold_amount']) ? floatval($data['hold_amount']) : $amount;
        $due_date = !empty($data['due_date']) ? $data['due_date'] : null;
        $notes = isset($data['notes']) ? $data['notes'] : null;

        $query = "INSERT INTO upcoming_expenses 
                    (user_id, name, amount, hold_amount, due_date, notes) 
                  VALUES 
                    (:user_id, :name, :amount, :hold_amount, :due_date, :notes)";

        $stmt = $pdo->prepare($query);

        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":amount", $amount);
        $stmt->bindParam(":hold_amount", $hold_amount);
        $stmt->bindParam(":due_date", $due_date);
        $stmt->bindParam(":notes", $notes);

        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Upcoming expense added"]);
        break;


    /* ---------------------------------------------------------
       PUT — Update an existing upcoming expense
    --------------------------------------------------------- */
    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['id']) || !isset($data['user_id'])) {
            echo json_encode(["success" => false, "message" => "Missing id or user_id"]);
            exit();
        }

        $id = intval($data['id']);
        $user_id = intval($data['user_id']);

        $name = $data['name'] ?? null;
        $amount = isset($data['amount']) ? floatval($data['amount']) : null;
        $hold_amount = isset($data['hold_amount']) ? floatval($data['hold_amount']) : null;
        $due_date = array_key_exists('due_date', $data) && $data['due_date'] !== "" ? $data['due_date'] : null;
        $notes = $data['notes'] ?? null;

        $query = "UPDATE upcoming_expenses SET 
                    name = :name,
                    amount = :amount,
                    hold_amount = :hold_amount,
                    due_date = :due_date,
                    notes = :notes
                  WHERE id = :id AND user_id = :user_id";

        $stmt = $pdo->prepare($query);

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":amount", $amount);
        $stmt->bindParam(":hold_amount", $hold_amount);
        $stmt->bindParam(":due_date", $due_date);
        $stmt->bindParam(":notes", $notes);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $user_id);

        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Upcoming expense updated"]);
        break;


    /* ---------------------------------------------------------
       DELETE — Remove an upcoming expense
    --------------------------------------------------------- */
    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['id']) || !isset($data['user_id'])) {
            echo json_encode(["success" => false, "message" => "Missing id or user_id"]);
            exit();
        }

        $id = intval($data['id']);
        $user_id = intval($data['user_id']);

        $query = "DELETE FROM upcoming_expenses WHERE id = :id AND user_id = :user_id";

        $stmt = $pdo->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Upcoming expense deleted"]);
        break;


    default:
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        break;
}
