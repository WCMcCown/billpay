<?php
// Basic landing page for the BillPay project
// This will eventually become the login page or dashboard
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BillPay</title>

    <!-- Bootstrap CSS (CDN) -->
    <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
        rel="stylesheet"
    >
</head>

<body class="bg-light">

    <nav class="navbar navbar-dark bg-primary">
        <div class="container-fluid">
            <span class="navbar-brand mb-0 h1">BillPay</span>
        </div>
    </nav>

    <div class="container py-5">
        <div class="text-center">
            <h1 class="mb-4">Welcome to BillPay</h1>
            <p class="lead">Your personal cash‑flow and debt‑reduction planner.</p>

            <a href="login.php" class="btn btn-primary btn-lg mt-3">Get Started</a>
        </div>
    </div>

    <!-- Bootstrap JS (CDN) -->
    <script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js">
    </script>

</body>
</html>
