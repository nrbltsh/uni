export function setupGroups(userRole, utils) {
    const { loadGroups, refreshToken } = utils;

    function loadGroupsTable() {
        $.get('/api/groups/', function(data) {
            let tbody = $('#groups-table tbody');
            tbody.empty();
            data.forEach(item => {
                tbody.append(`
                    <tr data-id="${item.id}">
                        <td>${item.name}</td>
                        <td data-faculty-id="${item.faculty ? item.faculty.id : ''}">${item.faculty ? item.faculty.name : 'Не указан'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-group">Редактировать</button>
                            <button class="btn btn-danger btn-sm delete-group">Удалить</button>
                        </td>
                    </tr>
                `);
                if (userRole !== 'manager') {
                    $('.edit-group').hide();
                    $('.delete-group').hide();
                }
            });
        }).fail(function(xhr) {
            console.error('Ошибка загрузки групп:', xhr.responseJSON);
        });
    }

    $('#add-group-form').submit(function(event) {
        event.preventDefault();
        const name = $('#group-name').val();
        const faculty_id = $('#group-faculty').val();
        if (!name || !faculty_id || faculty_id === "") {
            alert('Пожалуйста, заполните все поля для группы, включая выбор факультета.');
            return;
        }
        const data = {
            name: name,
            faculty_id: parseInt(faculty_id)
        };
        $.ajax({
            url: '/api/groups/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                alert('Группа добавлена!');
                setTimeout(function() {
                    loadGroups();
                    loadGroupsTable();
                    $('#add-group-form')[0].reset();
                }, 500);
            },
            error: function(xhr) {
                alert('Ошибка добавления: ' + JSON.stringify(xhr.responseJSON));
                if (xhr.status === 401) {
                    refreshToken(function() {
                        $.ajax(this);
                    });
                }
            }
        });
    });

    $(document).on('click', '.edit-group', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        const name = row.find('td:eq(0)').text();
        const facultyId = row.find('td:eq(1)').data('faculty-id');
        $('#edit-group-id').val(id);
        $('#edit-group-name').val(name);
        $('#edit-group-faculty').empty().append('<option value="">Выберите факультет</option>');
        $.get('/api/faculties/', function(data) {
            $('#edit-group-faculty').append(data.map(f => `<option value="${f.id}" ${f.id == facultyId ? 'selected' : ''}>${f.name}</option>`));
        });
        $('#edit-group-modal').modal('show');
    });

    $('#save-edit-group').click(function() {
        const name = $('#edit-group-name').val();
        const faculty_id = $('#edit-group-faculty').val();
        if (!name || !faculty_id) {
            alert('Пожалуйста, заполните все поля для группы.');
            return;
        }
        const data = {
            name: name,
            faculty_id: parseInt(faculty_id)
        };
        const id = $('#edit-group-id').val();
        $.ajax({
            url: `/api/groups/${id}/`,
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                alert('Группа обновлена!');
                setTimeout(function() {
                    loadGroups();
                    loadGroupsTable();
                    $('#edit-group-modal').modal('hide');
                }, 500);
            },
            error: function(xhr) {
                alert('Ошибка обновления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    $(document).on('click', '.delete-group', function() {
        if (confirm('Вы уверены, что хотите удалить эту группу?')) {
            const id = $(this).closest('tr').data('id');
            $.ajax({
                url: `/api/groups/${id}/`,
                method: 'DELETE',
                success: function() {
                    alert('Группа удалена!');
                    setTimeout(function() {
                        loadGroups();
                        loadGroupsTable();
                    }, 500);
                },
                error: function(xhr) {
                    alert('Ошибка удаления: ' + JSON.stringify(xhr.responseJSON));
                }
            });
        }
    });

    return { loadGroupsTable };
}