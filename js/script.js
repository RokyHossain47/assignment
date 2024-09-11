function fileUpload(files) {
    var formData = new FormData();
    formData.append('file', files[0]);

    $.ajax({
        url: 'upload.php', // Your PHP file for handling the upload
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) { // On success, show response
            if (response.indexOf("successfully") !== -1) {
                var newFontName = files[0].name.replace('.ttf', ''); // Get the uploaded file name
                var preview = 'Example Style';

                if ($('.empty-row').length > 0) {
                    $('.empty-row').remove();
                }

                // Create a delete button with a confirmation prompt
                var action = `
                    <button class="btn btn-danger delete-btn" onclick="confirmDelete(this)">Delete</button>
                `;

                // Append the new row to the table body
                var newRow = `
                    <tr id="row-${newFontName}">
                        <th scope="row">${$('#fontTableBody tr').length + 1}</th>
                        <td>${newFontName}</td>
                        <td>${preview}</td>
                        <td>${action}</td>
                    </tr>
                `;
                $('#fontTableBody').append(newRow);
                loadFontCount(); // Update the font list
            } else {
                alert("Upload failed: " + response);
            }
        },
        error: function(xhr, status, error) {
            alert('Error: ' + error);
        }
    });
}

// Trigger fileUpload when a file is selected
$('#file').on('change', function() {
    fileUpload(this.files);
});

// Drag-and-drop functionality
var dropArea = $('#uploadLabel');

// Highlight the drop area when the file is dragged over
dropArea.on('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).addClass('drag-over');
});

// Remove the highlight when the file is dragged out
dropArea.on('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).removeClass('drag-over');
});

// Handle the file drop
dropArea.on('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).removeClass('drag-over');
    
    var files = e.originalEvent.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith(".ttf")) {
        fileUpload(files); // Call your file upload function
    } else {
        // alert("Only TTF files are allowed.");
    }
});

function confirmDelete(button) {
    if (confirm("Are you sure you want to delete this font?")) {
        $(button).closest('tr').remove();
    }
}

function loadFontCount() {
    $.ajax({
        url: 'fonts.php', // URL to the PHP script that returns the file list
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            $('#fontTableBody').empty(); // Clear existing rows
            $('#fontCount').text(response.length); // Display the count

            if (response.length > 0) {
                // Remove old font-face rules to prevent duplicates
                $('style[id^="font-face-"]').remove();

                $.each(response, function(index, fileName) {
                    var fontName = fileName.replace('.ttf', '');
                    
                    // Create the @font-face CSS rule
                    var fontFaceRule = `
                        @font-face {
                            font-family: '${fontName}';
                            src: url('uploads/${fileName}') format('truetype');
                        }
                    `;

                    // Inject the @font-face rule into the document's head
                    var styleSheet = document.createElement("style");
                    styleSheet.type = "text/css";
                    styleSheet.id = `font-face-${fontName}`; // Unique ID to avoid duplicates
                    styleSheet.innerText = fontFaceRule;
                    document.head.appendChild(styleSheet);

                    // Create the table row
                    var row = `
                        <tr id="row-${fontName}">
                            <th scope="row">${index + 1}</th>
                            <td>${fontName}</td>
                            <td><span style="font-family: '${fontName}';">Example Style</span></td>
                            <td><button class="text-danger delete-btn" onclick="deleteFont('${fileName}')">Delete</button></td>
                        </tr>
                    `;

                    // Append the row to the table body
                    $('#fontTableBody').append(row);
                });
            } else {
                $('#fontTableBody').append('<tr class="empty-row"><td colspan="4" style="text-align:center;">No fonts found.</td></tr>');
            }
        },
        error: function(xhr, status, error) {
            console.log('Error fetching font list: ' + error);
            $('#fontCount').text('Error');
        }
    });
}

window.deleteFont = function(fileName) {
    if (confirm("Are you sure you want to delete this font?")) {
        $.ajax({
            url: 'fonts.php', // PHP script to handle font deletion
            type: 'POST',
            data: { fileName: fileName },
            success: function(response) {
                console.log(response);
                $('#row-' + fileName).remove();
                loadFontCount(); // Update the font list
            },
            error: function(xhr, status, error) {
                console.log('Error deleting file: ' + error);
            }
        });
    }
}

// Load the fonts when the page is ready
loadFontCount();


$(document).ready(function() {
    $.ajax({
        url: 'retrieveFonts.php', // Adjust the URL to your fonts.php path
        method: 'GET',
        success: function(data) {
            if (data.length > 0) {
                data.forEach(function(file) {
                    var fontName = file.replace('.ttf','')
                    $('.groupFont').append('<option value="' + file + '">' + fontName + '</option>');
                });
            } else {
                $('.groupFont').append('<option value="">No fonts available</option>');
            }
        },
        error: function() {
            alert('Failed to retrieve font files');
        }
    });

    // Function to clone the group-item and append it
    $('#newRow').click(function() {
        var newRow = $('#group-item').first().clone();
        newRow.find('input').val('');
        newRow.find('select').val('');
        newRow.find('.removeRow').show();
        newRow.appendTo('.new-row').insertBefore('.group-action-btn');
        newRow.find('.removeRow').click(function() {
            $(this).closest('.group-item').remove();
        });
    });

    // Function to clone the group-item and append it
    $('#modal-new-row').click(function() {
        // Clone the first group-item
        var newRow = $('#group-item').first().clone();

        // Clear input values from the cloned row
        newRow.find('input').val('');
        newRow.find('select').val('');

        // Show the remove button for the new row
        newRow.find('.removeRow').show();

        // Append the new row after the last .group-item
        newRow.appendTo('.modal-new-row').insertBefore('.modal-group-action-btn');

        // Add event listener for the new remove button
        newRow.find('.removeRow').click(function() {
            $(this).closest('.group-item').remove();
        });
    });

    // Remove row on clicking the remove button
    $(document).on('click', '.removeRow', function() {
        $(this).closest('.group-item').remove();
    });


    // Submit form via AJAX
    $('#submit').click(function (e) {
        e.preventDefault();
        // Ensure the form is valid using HTML5 validation
        var isValid = document.getElementById('groupForm').checkValidity();
        if (!isValid) {
            $('#groupForm')[0].reportValidity(); // Display validation messages if form is invalid
            return;
        }
        // Gather form data
        var formData = $('#groupForm').serializeArray();
        // Add the action parameter
        formData.push({ name: 'action', value: 'save' });
        // Send AJAX request to store data in JSON file
        $.ajax({
            url: 'saveGroup.php', // The PHP file that will handle the request
            type: 'POST',
            data: formData,
            success: function (response) {
                if(response == 'error') {
                    alert('Must be Select two font in group');
                }else{
                    $('#groupForm')[0].reset();
                    alert('Group created successfully!');
                    groupList();
                }
                console.log(response)
            },
            error: function () {
                alert('An error occurred while creating the group.');
            }
        });
    });

    function groupList() {
        $.ajax({
            url: 'saveGroup.php', // The PHP file that will handle the request
            type: 'POST',
            data: { 'action': 'list' },
            success: function (response) {
                var groups = JSON.parse(response); // Parse JSON if it's in string format
                var tableBody = $('#fontGroupBody'); // Get the table body
                tableBody.empty(); // Clear any existing rows in the table
    
                // Loop through each group and add rows
                groups.forEach(function (group, groupIndex) {
                    var groupName = group[0].title; // Assuming the first element in each group contains the title
                    var fontCount = group.length; // Count the number of fonts in the group
                    
                    // Concatenate names of fonts from the group
                    var fontNames = group.map(function (item) {
                        return item.font;
                    }).join(', ');
    
                    // Create a new row for each group with a delete button
                    var newRow = `<tr data-group-index="${groupIndex}">
                                    <td>${groupName}</td>
                                    <td>${fontNames}</td>
                                    <td>${fontCount}</td>
                                    <td>
                                    <button class="edit-btn text-primary" data-bs-toggle="modal" data-bs-target="#exampleModal" data-group-index="${groupIndex}">Edit</button>
                                    <button class="delete-btn text-danger" data-group-index="${groupIndex}">Delete</button>
                                    </td>
                                  </tr>`;
                    
                    // Append the row to the table body
                    tableBody.append(newRow);
                });
    
                // Add click event for delete buttons
                $('.delete-btn').click(function () {
                    var groupIndex = $(this).data('group-index');
                    deleteGroup(groupIndex);
                });
                // Add click event for edit buttons
                $('.edit-btn').click(function () {
                    var groupIndex = $(this).data('group-index');
                    editGroup(groupIndex);
                });
            },
            error: function () {
                alert('An error occurred while retrieving the groups.');
            }
        });
    }

    // Function to delete a group
    function deleteGroup(groupIndex) {
        if (confirm("Are you sure you want to delete this group?")) {
            $.ajax({
                url: 'saveGroup.php', // PHP file that will handle the delete request
                type: 'POST',
                data: { 'action': 'delete', 'groupIndex': groupIndex }, // Send the index of the group to delete
                success: function (response) {
                    var result = JSON.parse(response);
                    if (result.success) {
                        // Remove the row from the table
                        $('tr[data-group-index="' + groupIndex + '"]').remove();
                    } else {
                        alert('Failed to delete the group.');
                    }
                    console.log(response);
                },
                error: function () {
                    alert('An error occurred while deleting the group.');
                }
            });

            setTimeout(function(){
                // Check if the table is empty
                if ($('.group-table tbody tr').length === 0) {
                    // If no rows exist, show a "No groups exist" message
                    $('.group-table tbody').append('<tr><td colspan="3" class="text-center">No groups exist</td></tr>');
                }
            }, 200)
        }
    }


    function editGroup(groupIndex) {
        $.ajax({
            url: 'saveGroup.php', // PHP file that will handle the edit request
            type: 'POST',
            data: { 'action': 'edit', 'groupIndex': groupIndex }, // Send the index of the group to fetch
            success: function (response) {
                var result = JSON.parse(response);
    
                if (result.success) {
                    // Populate the modal with the fetched data
                    var groupData = result.data;
    
                    // Set the title
                    // $('#groupForm').find('input[name="title"]').val(groupData.title);
    
                    // Clear existing rows
                    $('#group-item').siblings('.group-item').remove();
                    $('.modal-new-row').empty();
    
                    // Add the title (this assumes there's only one title for the whole group)
                    if (groupData.items.length > 0) {
                        var titleRow = `
                        <div class="form-group">
                            <input type="text" name="title" class="form-control" value="${groupData.items[0].title}" placeholder="Group Title" required>
                        </div>`;
                        $('.modal-new-row').append(titleRow);
                    }

                    // Add each font group
                    groupData.items.forEach(function (item, index) {
                        var fontRow = `
                        <div class="group-item" id="group-item">
                            <div class="form-group me-2">
                                <input type="text" name="name[]" class="form-control" placeholder="Font Name" value="${item.name}" required>
                            </div>
                            <div class="form-group ms-2">
                                <select name="font[]" class="form-control groupFont" required>
                                    <option value="${item.font}" selected>${item.font}</option>
                                    <!-- Additional font options here -->
                                </select>
                            </div>
                            <button type="button" class="removeRow text-danger btn ms-2">X</button>
                        </div>`;
                        $('.modal-new-row').append(fontRow);
                    });
    
                    // Show the modal
                    $('#exampleModal').modal('show');
                } else {
                    alert('Failed to fetch group data.');
                }
            },
            error: function () {
                alert('An error occurred while fetching the group data.');
            }
        });
    }
    




    groupList();
});