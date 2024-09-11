<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    if ($action === 'save') {
        // Your save logic here
        saveGroupData();
    }elseif($action == 'list'){
        listGroup();
    }elseif($action == 'edit'){
        editGroup($_POST['groupIndex']);
    }elseif($action == 'delete'){
        deleteGroup($_POST['groupIndex']);
    }
}

function saveGroupData() {
    // Get form data from POST
    $groupData = [];

    // Assuming $title is an array of one element
    $title = $_POST['title'];
    $names = $_POST['name'];
    $fonts = $_POST['font'];

    if(count($names) < 2){
        echo 'error';
        exit;
    }

    // Combine data into an array
    for ($i = 0; $i < count($names); $i++) {
        $groupData[] = [
            'title' => $title,
            'name' => $names[$i],
            'font' => $fonts[$i]
        ];
    }

    // Define the directory and file path
    $directory = 'groups';
    $filePath = $directory . '/groupData.json';

    // Create directory if it doesn't exist
    if (!is_dir($directory)) {
        mkdir($directory, 0777, true);
    }

    // Initialize existing data array
    $existingData = [];

    // Check if the file exists and load existing data
    if (file_exists($filePath)) {
        $existingContent = file_get_contents($filePath);
        $existingData = json_decode($existingContent, true);

        // Ensure the existing data is an array
        if (!is_array($existingData)) {
            $existingData = [];
        }
    }

    // Add the new group data as a separate entry in the file
    $existingData[] = $groupData;

    // Write the updated data back to the file
    if (file_put_contents($filePath, json_encode($existingData))) {
        echo json_encode(['success' => true, 'message' => 'Group data saved successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save group data.']);
    }
}

function listGroup() {
    $filePath = 'groups/groupData.json';
    $existingData = [];
    if (file_exists($filePath)) {
        $existingContent = file_get_contents($filePath);
        $existingData = json_decode($existingContent, true);
        // Ensure the existing data is an array
        if (!is_array($existingData)) {
            $existingData = [];
        }
    }
     // Return the data as JSON
     echo json_encode($existingData);
}

// Function to delete a group by index
function deleteGroup($groupIndex) {
    $filePath = 'groups/groupData.json';
    $existingData = [];

    if (file_exists($filePath)) {
        $existingContent = file_get_contents($filePath);
        $existingData = json_decode($existingContent, true);

        // Ensure the existing data is an array
        if (!is_array($existingData)) {
            echo json_encode(['success' => false, 'message' => 'Invalid data format']);
            exit;
        }

        // Remove the group at the specified index
        if (isset($existingData[$groupIndex])) {
            unset($existingData[$groupIndex]);
            $existingData = array_values($existingData); // Reindex the array

            // Save the updated data back to the file
            if (file_put_contents($filePath, json_encode($existingData))) {
                echo json_encode(['success' => true, 'message' => 'Group deleted successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update the JSON file.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Group not found.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'File not found.']);
    }
}

// Function to delete a group by index
function editGroup($groupIndex) {
    $filePath = 'groups/groupData.json';
    $existingData = [];

    if (file_exists($filePath)) {
        $existingContent = file_get_contents($filePath);
        $existingData = json_decode($existingContent, true);

        // Ensure the existing data is an array
        if (is_array($existingData) && isset($existingData[$groupIndex])) {
            $groupData = $existingData[$groupIndex];

            // Prepare response data
            $response = [
                'success' => true,
                'data' => [
                    'title' => $groupData[0]['title'],
                    'items' => $groupData
                ]
            ];

            echo json_encode($response);
        } else {
            echo json_encode(['success' => false, 'message' => 'Group not found.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'File not found.']);
    }
}


?>
