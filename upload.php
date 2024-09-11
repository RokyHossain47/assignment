<?php
// Check if a file is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Define the target directory
    $targetDir = "uploads/";
    
    // Create the uploads directory if it doesn't exist
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    // Get file information
    $file = $_FILES['file'];
    $fileName = basename($file['name']);
    $fileTmpPath = $file['tmp_name'];
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // Check if the file is a .ttf file
    if ($fileType !== 'ttf') {
        echo "Only .ttf files are allowed.";
        exit;
    }

    // Set the destination path
    $targetFilePath = $targetDir . $fileName;
    if (file_exists($targetFilePath)) {
        echo "File already exists.";
        exit;
    }

    // Check if file was uploaded without errors
    if ($file['error'] === UPLOAD_ERR_OK) {
        // Move the file to the uploads directory
        if (move_uploaded_file($fileTmpPath, $targetFilePath)) {
            echo "The file ". htmlspecialchars($fileName) . " has been uploaded successfully.";
        } else {
            echo "Sorry, there was an error uploading your file.";
        }
    } else {
        echo "File upload error: " . $file['error'];
    }
} else {
    echo "No file uploaded.";
}
