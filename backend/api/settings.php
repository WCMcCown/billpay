<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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
       GET — Load settings for a user
    --------------------------------------------------------- */
    case "GET":
        if (!isset($_GET['user_id'])) {
            echo json_encode(["success" => false, "message" => "Missing user_id"]);
            exit();
        }

        $user_id = intval($_GET['user_id']);

        $query = "SELECT * FROM settings WHERE user_id = :user_id LIMIT 1";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $settings = $stmt->fetch(PDO::FETCH_ASSOC);

        // If no settings exist yet, return defaults
        if (!$settings) {
            $settings = [
                "user_id" => $user_id,
                "pay_frequency" => null,
                "next_payday" => null
            ];
        }

        echo json_encode(["success" => true, "settings" => $settings]);
        break;


    /* ---------------------------------------------------------
       POST — Save or update settings
    --------------------------------------------------------- */
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['user_id'])) {
            echo json_encode(["success" => false, "message" => "Missing user_id"]);
            exit();
        }

        $user_id = intval($data['user_id']);
        $pay_frequency = $data['pay_frequency'] ?? null;
        $next_payday = !empty($data['next_payday']) ? $data['next_payday'] : null;

        // Check if settings already exist
        $check = $pdo->prepare("SELECT id FROM settings WHERE user_id = :user_id LIMIT 1");
        $check->bindParam(":user_id", $user_id);
        $check->execute();

        if ($check->rowCount() > 0) {
            // Update existing settings
            $query = "UPDATE settings SET 
                        pay_frequency = :pay_frequency,
                        next_payday = :next_payday,
                        updated_at = NOW()
                      WHERE user_id = :user_id";
        } else {
            // Insert new settings
            $query = "INSERT INTO settings 
                        (user_id, pay_frequency, next_payday) 
                      VALUES 
                        (:user_id, :pay_frequency, :next_payday)";
        }

        $stmt = $pdo->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":pay_frequency", $pay_frequency);
        $stmt->bindParam(":next_payday", $next_payday);

        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Settings saved"]);
        break;


    default:
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        break;
}
