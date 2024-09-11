<?php
$directory = 'uploads/';

// Handle file deletion
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['fileName'])) {
    $fileName = basename($_POST['fileName']); // Sanitize the filename
    $filePath = $directory . $fileName;

    // Check if the file exists
    if (file_exists($filePath)) {
        if (unlink($filePath)) {
            echo "File deleted successfully.";
        } else {
            echo "Error deleting file.";
        }
    } else {
        echo "File not found.";
    }
    exit; // Ensure no further code is executed
}

// Handle file listing
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $files = array();

    // Check if the directory exists
    if (is_dir($directory)) {
        // Scan the directory for files
        $scannedFiles = scandir($directory);

        // Filter the list for only .ttf files
        foreach ($scannedFiles as $file) {
            $filePath = $directory . $file;
            if (is_file($filePath) && strtolower(pathinfo($filePath, PATHINFO_EXTENSION)) === 'ttf') {
                $files[] = $file;
            }
        }
    }

    // Return the file list as JSON
    echo json_encode($files);
}
?>


