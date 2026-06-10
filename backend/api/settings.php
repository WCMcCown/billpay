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

        if ($settings) {
            // Ensure column_order always exists
            $settings["column_order"] = $settings["column_order"] ?? null;
        } else {
            // Default settings for new users
            $settings = [
                "user_id" => $user_id,
                "column_order" => null,
                "pay_frequency" => null,
                "next_payday" => null,
                "starting_amount" => 0,
                "responsive_mode" => 1,
                "layout_phone" => "cards",
                "layout_tablet" => "compact",
                "layout_desktop" => "full",
                "layout_global" => "full",
                "reserve_amount" => 0
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
        $reserve_amount = isset($data['reserve_amount']) ? floatval($data['reserve_amount']) : 0;
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
                        reserve_amount = :reserve_amount,
                        updated_at = NOW()
                      WHERE user_id = :user_id";
        } else {
            $query = "INSERT INTO settings 
                (user_id, pay_frequency, next_payday, starting_amount,
                responsive_mode, layout_phone, layout_tablet, layout_desktop, layout_global, reserve_amount)
                      VALUES 
                        (:user_id, :pay_frequency, :next_payday, :starting_amount,
                         :responsive_mode, :layout_phone, :layout_tablet, :layout_desktop, :layout_global, :reserve_amount)";
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
        $stmt->bindParam(":reserve_amount", $reserve_amount);
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
            $starting_amount = isset($data['starting_amount']) ? floatval($data['starting_amount']) : null;
            $reserve_amount = isset($data['reserve_amount']) ? floatval($data['reserve_amount']) : null;

            $query = "UPDATE settings SET updated_at = NOW()";
            $params = [":user_id" => $user_id];

            if ($starting_amount !== null) {
                $query .= ", starting_amount = :starting_amount";
                $params[":starting_amount"] = $starting_amount;
            }

            if ($reserve_amount !== null) {
                $query .= ", reserve_amount = :reserve_amount";
                $params[":reserve_amount"] = $reserve_amount;
            }

            $query .= " WHERE user_id = :user_id";

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);

            echo json_encode(["success" => true, "message" => "Settings updated"]);
            break;

}
