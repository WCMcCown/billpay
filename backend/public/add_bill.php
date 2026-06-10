<?php
session_start();
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$errors = [];
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name   = trim($_POST['name']);
    $amount = floatval($_POST['amount']);
    $due    = intval($_POST['due_day']);
    $link   = trim($_POST['link']);
    $autopay = isset($_POST['autopay']) ? 1 : 0;

    if ($name === '') {
        $errors[] = "Bill name is required.";
    }

    if ($amount <= 0) {
        $errors[] = "Amount must be greater than zero.";
    }

    if ($due < 1 || $due > 31) {
        $errors[] = "Due day must be between 1 and 31.";
    }

    if (empty($errors)) {
        $db = new Database();

        $stmt = $db->pdo->prepare(
            "INSERT INTO bills (user_id, name, amount, due_day, link, autopay)
             VALUES (?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            $_SESSION['user_id'],
            $name,
            $amount,
            $due,
            $link,
            $autopay
        ]);

        $success = true;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Bill</title>

    <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
        rel="stylesheet"
    >
</head>

<body class="bg-light">

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6">

            <div class="card shadow-sm">
                <div class="card-body">

                    <h3 class="text-center mb-4">Add a New Bill</h3>

                    <?php if ($success): ?>
                        <div class="alert alert-success">
                            Bill added successfully!
                            <a href="bills.php">View Bills</a>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($errors)): ?>
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                <?php foreach ($errors as $e): ?>
                                    <li><?= htmlspecialchars($e) ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>

                    <form method="POST">

                        <div class="mb-3">
                            <label class="form-label">Bill Name</label>
                            <input type="text" name="name" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Amount</label>
                            <input type="number" step="0.01" name="amount" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <select name="type" class="form-select">
                                <input type="number" step="0.01" name="remaining" class="form-control">
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Due Day (1–31)</label>
                            <input type="number" name="due_day" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Link to Pay (optional)</label>
                            <input type="url" name="link" class="form-control">
                        </div>

                        <div class="form-check mb-3">
                            <input type="checkbox" name="autopay" class="form-check-input" id="autopay">
                            <label for="autopay" class="form-check-label">Autopay</label>
                        </div>

                        <div class="mb-3">
                            <input type="number" step="0.01" name="apr" class="form-control">
                        </div>

                        <div class="mb-3">
                            <select name="type" class="form-select">
                                <option value="recurring">Recurring Bill</option>
                                <option value="debt">Debt</option>
                            </select>
                        </div>

                        <button class="btn btn-primary w-100">Add Bill</button>

                    </form>

                </div>
            </div>

        </div>
    </div>
</div>

</body>
</html>
