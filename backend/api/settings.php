<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

require_once "../config/database.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "OPTIONS") {
    http_response_code(200);
    exit();
}

try {
    $db = new Database();
    $pdo = $db->pdo;
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

switch ($method) {

    case "GET":
        if (!isset($_GET['user_id'])) {
            echo json_encode(["success" => false, "message" => "Missing user_id"]);
            exit();
        }

        $user_id = intval($_GET['user_id']);

        $stmt = $pdo->prepare("SELECT * FROM settings WHERE user_id = :user_id LIMIT 1");
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $settings = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$settings) {
            $settings = [
                "user_id" => $user_id,
                "pay_frequency" => null,
                "next_payday" => null,
                "starting_amount" => 0,
                "responsive_mode" => 1,
                "layout_phone" => "cards",
                "layout_tablet" => "compact",
                "layout_desktop" => "full",
                "layout_global" => "full"
            ];
        }

        echo json_encode(["success" => true, "settings" => $settings]);
        break;


    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['user_id'])) {
            echo json_encode(["success" => false, "message" => "Missing user_id"]);
            exit();
        }

        $user_id = intval($data['user_id']);
        $pay_frequency = $data['pay_frequency'] ?? null;
        $next_payday = !empty($data['next_payday']) ? $data['next_payday'] : null;
        $starting_amount = isset($data['starting_amount']) ? floatval($data['starting_amount']) : 0;
        $responsive_mode = isset($data['responsive_mode']) ? intval($data['responsive_mode']) : 1;
        $layout_phone = $data['layout_phone'] ?? "cards";
        $layout_tablet = $data['layout_tablet'] ?? "compact";
        $layout_desktop = $data['layout_desktop'] ?? "full";
        $layout_global = $data['layout_global'] ?? "full";

        $check = $pdo->prepare("SELECT id FROM settings WHERE user_id = :user_id LIMIT 1");
        $check->bindParam(":user_id", $user_id);
        $check->execute();

        if ($check->rowCount() > 0) {
            $query = "UPDATE settings SET 
                        pay_frequency = :pay_frequency,
                        next_payday = :next_payday,
                        starting_amount = :starting_amount,
                        responsive_mode = :responsive_mode,
                        layout_phone = :layout_phone,
                        layout_tablet = :layout_tablet,
                        layout_desktop = :layout_desktop,
                        layout_global = :layout_global,
                        updated_at = NOW()
                      WHERE user_id = :user_id";
        } else {
            $query = "INSERT INTO settings 
                (user_id, pay_frequency, next_payday, starting_amount,
                responsive_mode, layout_phone, layout_tablet, layout_desktop, layout_global)
                      VALUES 
                        (:user_id, :pay_frequency, :next_payday, :starting_amount,
                         :responsive_mode, :layout_phone, :layout_tablet, :layout_desktop, :layout_global)";
        }

        $stmt = $pdo->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":pay_frequency", $pay_frequency);
        $stmt->bindParam(":next_payday", $next_payday);
        $stmt->bindParam(":starting_amount", $starting_amount);
        $stmt->bindParam(":responsive_mode", $responsive_mode);
        $stmt->bindParam(":layout_phone", $layout_phone);
        $stmt->bindParam(":layout_tablet", $layout_tablet);
        $stmt->bindParam(":layout_desktop", $layout_desktop);
        $stmt->bindParam(":layout_global", $layout_global);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Settings saved"]);
        break;

        case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['user_id'])) {
            echo json_encode(["success" => false, "message" => "Missing user_id"]);
            exit();
        }

        $user_id = intval($data['user_id']);
        $starting_amount = isset($data['starting_amount']) ? floatval($data['starting_amount']) : 0;

        // Update ONLY starting_amount
        $stmt = $pdo->prepare("
            UPDATE settings SET
                starting_amount = :starting_amount,
                updated_at = NOW()
            WHERE user_id = :user_id
        ");

        $stmt->bindParam(":starting_amount", $starting_amount);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Starting amount updated"]);
        break;


    default:
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        break;
}
