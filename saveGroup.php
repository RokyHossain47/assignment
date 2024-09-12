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
    }elseif($action == 'update'){
        updateGroup($_POST['groupIndex']);
    }elseif($action == 'delete'){
        deleteGroup($_POST['groupIndex']);
    }elseif($action == 'editGroup'){
        editGroupList();
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
    $filePath = $directory . '/'.time().'-groupData.json';

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
    $directory = 'groups'; // specify the folder path
    $jsonFiles = glob($directory . '/*.json'); // find all .json files in the folder
    $allGroups = [];

    // Loop through each JSON file and decode the content
    foreach ($jsonFiles as $filePath) {
        $existingContent = file_get_contents($filePath);
        $groupData = json_decode($existingContent, true);
        // Ensure the data is an array and add it to the result
        if (is_array($groupData)) {
            $allGroups[] = $groupData;
        }
    }

    // Return the data as JSON
    echo json_encode($allGroups);
}


// Function to delete a group by index
function deleteGroup($groupIndex) {

    $directory = 'groups'; // specify the folder path
    $jsonFiles = glob($directory . '/*.json'); // find all .json files in the folder
    $fileIndex = explode('-',$groupIndex);
    // Loop through each JSON file and decode the content
    foreach ($jsonFiles as $key => $filePath) {
        // echo $filePath;
        // echo "?";
        if(file_exists($filePath)){
            if($key == $fileIndex[0]) {
                // Delete the JSON file
                if (unlink($filePath)) {
                    echo json_encode(['success' => true, 'message' => 'Group and file deleted successfully.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to delete the file.']);
                }
            }
        }else{
            echo json_encode(['success' => false, 'message' => 'Group not found.']);
        }
    }
}


// Function to delete a group by index
function editGroup($groupIndex) {
    $directory = 'groups'; // specify the folder path
    $jsonFiles = glob($directory . '/*.json'); // find all .json files in the folder
    $fileIndex = explode('-',$groupIndex);
    // Loop through each JSON file and decode the content
    foreach ($jsonFiles as $key => $filePath) {
        // echo $filePath;
        // echo "?";
        if(file_exists($filePath)){
            if($key == $fileIndex[0]) {
                $existingContent = file_get_contents($filePath);
                echo json_encode(['success' => true, 'data' => $existingContent, 'filePath' => $filePath]);
            }
        }else{
            echo json_encode(['error' => false, 'message' => 'Group not found.']);
        }
    }
}


// Function to update a group
function updateGroup($groupIndex) {
    // Check if 'title' is set in the POST data
    if (!isset($_POST['title']) || !isset($_POST['name']) || !isset($_POST['font'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }

    // Get the data from POST request
    $title = $_POST['title'];
    $names = $_POST['name'];
    $fonts = $_POST['font'];
    $prevTitle = $_POST['prevTitle'];

    print_r($prevTitle);

    $filePath = 'groups/groupData.json';
    $existingData = [];

    // Load existing data from JSON file
    if (file_exists($filePath)) {
        $existingContent = file_get_contents($filePath);
        $existingData = json_decode($existingContent, true);
    }

    // Flag to check if the group was updated
    $groupUpdated = false;

    // Loop through existing data to find the group by title and update it
    foreach ($existingData as $key => $group) {
        print_r($group[$key]['name']);
        //die;
        // Check if the title matches
        if ($group[$key]['title'] == $title) {
            // Update the group's items (name and font)
            foreach ($group['items'] as $itemIndex => &$item) {
                $item['name'] = $names[$itemIndex];  // Update name
                $item['font'] = $fonts[$itemIndex];  // Update font
            }
            $groupUpdated = true;
            break; // Exit loop once the group is found and updated
        }
    }

    // // Save the updated data back to the JSON file
    // if ($groupUpdated) {
    //     $jsonData = json_encode($existingData, JSON_PRETTY_PRINT);
    //     if (file_put_contents($filePath, $jsonData)) {
    //         echo json_encode(['success' => true, 'message' => 'Group updated successfully.']);
    //     } else {
    //         echo json_encode(['success' => false, 'message' => 'Failed to save updated group data.']);
    //     }
    // } else {
    //     echo json_encode(['success' => false, 'message' => 'Group not found.']);
    // }
}

function editGroupList() {
    $filePath = $_POST['filePath'];
    $save = saveGroupData();
    
    if(file_exists($filePath)) {
        // Try to delete the JSON file
        if(unlink($filePath)) {
            echo "File deleted successfully.";
        } else {
            echo "Error: Could not delete the file.";
        }
    }
}



?>
