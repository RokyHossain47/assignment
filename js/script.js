function fileUpload(files) {
    var formData = new FormData();
    formData.append('file', files[0]);

    $.ajax({
        url: 'upload.php',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.indexOf("successfully") !== -1) {
                var newFontName = files[0].name.replace('.ttf', '');
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
                loadFontCount(); // load the font list
                loadFontList();
                alert('Font uploaded successfully!');
            } else {
                alert("Upload failed: " + response);
            }
        },
        error: function(xhr, status, error) {
            alert('Error: ' + error);
        }
    });
}

function confirmDelete(button) {
    if (confirm("Are you sure you want to delete this font?")) {
        $(button).closest('tr').remove();
    }
}

function loadFontCount() {
    $.ajax({
        url: 'fonts.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            $('#fontTableBody').empty();
            $('#fontCount').text(response.length);
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
                    styleSheet.id = `font-face-${fontName}`;
                    styleSheet.innerText = fontFaceRule;
                    document.head.appendChild(styleSheet);
                    // Create the table row
                    var row = `
                        <tr id="row-${fontName}">
                            <th scope="row">${index + 1}</th>
                            <td>${fontName}</td>
                            <td><span style="font-family: '${fontName}';">Example Style</span></td>
                            <td><button class="text-danger font-delete-btn" onclick="deleteFont('${fileName}')">Delete</button></td>
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


function loadFontList() {
    $.ajax({
        url: 'retrieveFonts.php',
        method: 'GET',
        success: function(data) {
            $('.groupFont').empty();
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
}


function groupList() {
    $.ajax({
        url: 'saveGroup.php',
        type: 'POST',
        data: { 'action': 'list' },
        success: function (response) {
            var allGroups = JSON.parse(response);
            var tableBody = $('#fontGroupBody');
            tableBody.empty();
            if(jQuery.isEmptyObject(allGroups)){
                var emptyRow = `<tr> <td colspan="3" class="text-center">No groups exist</td> </tr>`;
                tableBody.append(emptyRow);
            }else{
                // Loop through each group (representing each JSON file)
                allGroups.forEach(function (groups, groupIndex) {
                    // If groups exist, loop through and append rows for each group
                    groups.forEach(function (group, groupItemIndex) {
                        var groupName = group[0].title; // assuming first item has the group title
                        var fontCount = group.length;
                        var fontNames = group.map(function (item) {
                            return item.font;
                        }).join(', ');
    
                        // Create a new row for each group
                        var newRow = `<tr data-group-index="${groupIndex}-${groupItemIndex}">
                                        <td>${groupName}</td>
                                        <td>${fontNames}</td>
                                        <td>${fontCount}</td>
                                        <td>
                                            <button class="edit-btn text-primary" data-bs-toggle="modal" data-bs-target="#exampleModal" data-group-index="${groupIndex}-${groupItemIndex}">Edit</button>
                                            <button class="delete-btn text-danger" data-group-index="${groupIndex}-${groupItemIndex}">Delete</button>
                                        </td>
                                    </tr>`;
                        // Append the row to the table body
                        tableBody.append(newRow);
                    });
                });
            }

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
            url: 'saveGroup.php', // Your PHP file for handling the deletion
            type: 'POST',
            data: { 'action': 'delete', 'groupIndex': groupIndex },
            success: function (response) {
                var result = JSON.parse(response);
                if (result.success) {
                    // Remove the table row associated with the deleted group
                    $('tr[data-group-index="' + groupIndex + '"]').remove();

                    // Check if the table is empty
                    if ($('#fontGroupBody tr').length === 0) {
                        $('#fontGroupBody').append('<tr><td colspan="3" class="text-center">No groups exist</td></tr>');
                    }
                } else {
                    alert('Failed to delete the group: ' + result.message);
                }
            },
            error: function () {
                alert('An error occurred while deleting the group.');
            }
        });
    }
}

function editGroup(groupIndex) {
    $.ajax({
        url: 'saveGroup.php',
        type: 'POST',
        data: { 'action': 'edit', 'groupIndex': groupIndex },
        success: function (response) {
            var result = JSON.parse(response);

            if (result.success) {
                var groupData = JSON.parse(result.data);
                // Clear existing rows
                $('#group-item').siblings('.group-item').remove();
                
                // $('.modal-new-row').empty();
                // $('.modal-input-select').empty();
                $('.modal-input-select').children().not('.modal-group-action-btn').empty();



                console.log(groupData)

                // Ensure groupData is an array
                if (Array.isArray(groupData) && groupData.length > 0) {
                    var titleRow = `
                    <div class="form-group">
                        <input type="text" name="title" id="prevTitle" class="form-control" value="${groupData[0][0].title}" placeholder="Group Title" required>
                    </div>
                    <input type="text" name="filePath" class="form-control d-none" value="${result.filePath}" required>
                    `;
                    $('.modal-input-select').append(titleRow);

                    groupData[0].forEach(function (item) {
                        var fontRow = `
                            <div class="group-item">
                                <div class="form-group me-2">
                                    <input type="text" name="name[]" class="form-control" placeholder="Font Name" value="${item.name}" required>
                                </div>
                                <div class="form-group ms-2">
                                    <select name="font[]" class="form-control groupFont" required>
                                        <option value="${item.font}" selected>${item.font}</option>
                                    </select>
                                </div>
                                <button type="button" class="removeRow text-danger btn ms-2">X</button>
                            </div>`;
                        $('.modal-input-select').append(fontRow);
                    });

                    // Show the modal
                    $('#exampleModal').modal('show');
                } else {
                    alert('No items found in the group.');
                }
            } else {
                alert('Failed to fetch group data: ' + result.message);
            }
        },
        error: function () {
            alert('An error occurred while fetching the group data.');
        }
    });
}

$(document).ready(function() {
   
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
            fileUpload(files);
        } else {
            // alert("Only TTF files are allowed.");
        }
    });

    // Load the fonts when the page is ready
    loadFontCount();
    
    loadFontList();

    
    // delete font from list
    window.deleteFont = function(fileName) {
        if (confirm("Are you sure you want to delete this font?")) {
            $.ajax({
                url: 'fonts.php',
                type: 'POST',
                data: { fileName: fileName },
                success: function(response) {
                    console.log(response);
                    $('#row-' + fileName).remove();
                    loadFontCount();
                    loadFontList();
                },
                error: function(xhr, status, error) {
                    console.log('Error deleting file: ' + error);
                }
            });
        }
    }

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
        loadFontList();
    });

    // Function to clone the group-item and append it
    $('#modal-new-row-id').click(function() {
        var newRow = $('#group-item').first().clone();
        newRow.find('input').val('');
        newRow.find('select').val('');
        newRow.find('.removeRow').show();
        newRow.appendTo('.modal-new-row').insertBefore('.modal-group-action-btn');
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
            $('#groupForm')[0].reportValidity();
            return;
        }
        // Gather form data
        var formData = $('#groupForm').serializeArray();
        formData.push({ name: 'action', value: 'save' });
        $.ajax({
            url: 'saveGroup.php',
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

    $('#groupUpdate').click(function (e) {
        e.preventDefault();
        var formData = $('.modal-input-select input, .modal-input-select select').serializeArray();
        // var filePath = formData.find(item => item.name === "filePath")?.value;
        formData.push({ name: 'action', value: 'editGroup' });
        // console.log(filePath)
        $.ajax({
            url: 'saveGroup.php',
            type: 'POST',
            data: formData,
            success: function (response) {
                if(response) {
                    // $('.modal-input-select').empty();
                    $('#exampleModal').modal('hide');
                    groupList();
                }else{
                    alert('Something Wrong');
                }
            },
            error: function () {
                alert('An error occurred while creating the group.');
            }
        });

    });
    
    


    // // Save edited group
    // $('#saveEditGroup').click(function (e) {
    //     e.preventDefault();
        
    //     // Gather form data from the modal
    //     var formData = $('.modal-new-row input, .modal-new-row select').serializeArray();
    //     // Add the action and groupIndex to the data
    //     formData.push({ name: 'prevTitle', value: $('#prevTitle').val() });
    //     formData.push({ name: 'action', value: 'update' });
    //     formData.push({ name: 'groupIndex', value: $('#groupIndex').val() }); // Ensure groupIndex is passed
    //     // console.log(formData);

    //     // Send AJAX request to update the group
    //     $.ajax({
    //         url: 'saveGroup.php', // PHP file to handle the update request
    //         type: 'POST',
    //         data: formData,
    //         success: function (response) {
    //             console.log(response)
    //             // var result = JSON.parse(response);
    //             // if (result.success) {
    //             //     alert('Group updated successfully!');
    //             //     $('#exampleModal').modal('hide'); // Hide the modal after successful update
    //             //     groupList(); // Refresh the group list to reflect the changes
    //             // } else {
    //             //     alert('Failed to update the group.');
    //             // }
    //         },
    //         error: function () {
    //             alert('An error occurred while updating the group.');
    //         }
    //     });
    // });

    




    groupList();
});