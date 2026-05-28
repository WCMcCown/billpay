<?php
require_once __DIR__ . '/../config/database.php';

$errors = [];
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name  = trim($_POST['name']);
    $email = trim($_POST['email']);
    $pass1 = $_POST['password'];
    $pass2 = $_POST['confirm_password'];

    // Basic validation
    if ($name === '') {
        $errors[] = "Name is required.";
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "A valid email is required.";
    }

    if ($pass1 !== $pass2) {
        $errors[] = "Passwords do not match.";
    }

    if (strlen($pass1) < 6) {
        $errors[] = "Password must be at least 6 characters.";
    }

    if (empty($errors)) {
        $db = new Database();

        // Check if email already exists
        $stmt = $db->pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);

        if ($stmt->fetch()) {
            $errors[] = "An account with that email already exists.";
        } else {
            // Hash password (best practice)
            $hash = password_hash($pass1, PASSWORD_DEFAULT);

            $stmt = $db->pdo->prepare(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
            );
            $stmt->execute([$name, $email, $hash]);

            $success = true;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account</title>

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

                    <h3 class="text-center mb-4">Create Your Account</h3>

                    <?php if ($success): ?>
                        <div class="alert alert-success">
                            Account created successfully!  
                            <a href="login.php">Click here to log in.</a>
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
                            <label class="form-label">Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                class="form-control"
                                required
                            >
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                class="form-control"
                                required
                            >
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                class="form-control"
                                required
                            >
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Confirm Password</label>
                            <input 
                                type="password" 
                                name="confirm_password" 
                                class="form-control"
                                required
                            >
                        </div>

                        <button class="btn btn-primary w-100">
                            Create Account
                        </button>

                    </form>

                </div>
            </div>

        </div>
    </div>
</div>

</body>
</html>
