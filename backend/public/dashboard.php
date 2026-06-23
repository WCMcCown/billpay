<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$name = htmlspecialchars($_SESSION['user_name']);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>

    <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
        rel="stylesheet"
    >
</head>

<body class="bg-light">

<nav class="navbar navbar-dark bg-primary">
    <div class="container-fluid">
        <span class="navbar-brand">BillPay</span>
        <span class="navbar-text">
            Logged in as <?= $name ?>
        </span>
    </div>
</nav>

<div class="container py-5">
    <h1>Welcome, <?= $name ?>!</h1>
    <p>This is your dashboard. Soon it will show bills, paychecks, and your available-to-spend amount.</p>
</div>

</body>
</html>
