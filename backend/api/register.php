<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require_once "../config/database.php";

$db = new Database();
$pdo = $db->pdo;

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"] ?? "";
$password = $data["password"] ?? "";
$name = $data["name"] ?? null;

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

// Check if email exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->fetch()) {
    echo json_encode(["success" => false, "message" => "Email already registered"]);
    exit;
}

// Hash password
$hashed = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $pdo->prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)");
$success = $stmt->execute([$email, $hashed, $name]);

echo json_encode(["success" => $success]);
