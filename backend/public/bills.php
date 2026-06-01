<?php
session_start();
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$db = new Database();

$stmt = $db->pdo->prepare("SELECT * FROM bills WHERE user_id = ? ORDER BY due_day ASC");
$stmt->execute([$_SESSION['user_id']]);
$bills = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Bills</title>

    <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
        rel="stylesheet"
    >
</head>

<body class="bg-light">

<nav class="navbar navbar-dark bg-primary">
    <div class="container-fluid">
        <span class="navbar-brand">BillPay</span>
        <a href="add_bill.php" class="btn btn-light btn-sm">Add Bill</a>
    </div>
</nav>

<div class="container py-4">

    <h2>Your Bills</h2>

    <?php if (empty($bills)): ?>
        <p>You have no bills yet.</p>
    <?php else: ?>

        <table class="table table-striped table-bordered mt-3">
            <thead class="table-primary">
                <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Due Day</th>
                    <th>Autopay</th>
                    <th>Link</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
            </thead>

            <tbody>
                <?php foreach ($bills as $bill): ?>
                    <tr>
                        <td><?= htmlspecialchars($bill['name']) ?></td>
                        <td>$<?= number_format($bill['amount'], 2) ?></td>
                        <td><?= $bill['due_day'] ?></td>
                        <td><?= $bill['autopay'] ? "Yes" : "No" ?></td>
                        <td>
                            <?php if ($bill['link']): ?>
                                <a href="<?= htmlspecialchars($bill['link']) ?>" target="_blank">Pay</a>
                            <?php endif; ?>
                        </td>
                        <td>
                            <a href="edit_bill.php?id=<?= $bill['id'] ?>" class="btn btn-sm btn-warning">Edit</a>
                        </td>
                        <td>
                            <a href="delete_bill.php?id=<?= $bill['id'] ?>" class="btn btn-sm btn-danger"
                               onclick="return confirm('Delete this bill?')">Delete</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>

        </table>

    <?php endif; ?>

</div>

</body>
</html>
