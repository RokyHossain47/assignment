<?php
    // retrieve.php
    $directory = 'uploads'; // Set the path to your upload directory
    $files = array_diff(scandir($directory), array('.', '..'));

    $ttf_files = [];
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) == 'ttf') {
            $ttf_files[] = $file;
        }
    }

    // Return the result as JSON
    header('Content-Type: application/json');
    echo json_encode($ttf_files);
?>