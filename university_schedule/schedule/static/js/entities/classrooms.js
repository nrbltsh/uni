export function setupClassrooms(userRole, utils) {
    const { loadClassrooms } = utils;

    function loadClassroomsTable() {
        $.get('/api/classrooms/', function(data) {
            let tbody = $('#classrooms-table tbody');
            tbody.empty();
            data.forEach(item => {
                tbody.append(`
                    <tr data-id="${item.id}">
                        <td>${item.name}</td>
                        <td data-faculty-id="${item.faculty ? item.faculty.id : ''}">${item.faculty ? item.faculty.name : 'Не указан'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-classroom">Редактировать</button>
                            <button class="btn btn-danger btn-sm delete-classroom">Удалить</button>
                        </td>
                    </tr>
                `);
                if (userRole !== 'manager') {
                    $('.edit-classroom').hide();
                    $('.delete-classroom').hide();
                }
            });
        }).fail(function(xhr) {
            console.error('Ошибка загрузки аудиторий:', xhr.responseJSON);
        });
    }

    $('#add-classroom-form').submit(function(event) {
        event.preventDefault();
        const name = $('#classroom-name').val();
        const faculty_id = $('#classroom-faculty').val();
        if (!name || !faculty_id) {
            alert('Пожалуйста, заполните все поля аудитории, включая выбор факультета.');
            return;
        }
        const data = {
            name: name,
            faculty_id: parseInt(faculty_id)
        };
        $.ajax({
            url: '/api/classrooms/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                alert('Аудитория добавлена!');
                setTimeout(function() {
                    loadClassrooms();
                    loadClassroomsTable();
                    $('#add-classroom-form')[0].reset();
                }, 500);
            },
            error: function(xhr) {
                alert('Ошибка добавления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    $(document).on('click', '.edit-classroom', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        const name = row.find('td:eq(0)').text();
        const facultyId = row.find('td:eq(1)').data('faculty-id');
        $('#edit-classroom-id').val(id);
        $('#edit-classroom-name').val(name);
        $('#edit-classroom-faculty').empty().append('<option value="">Выберите факультет</option>');
        $.get('/api/faculties/', function(data) {
            $('#edit-classroom-faculty').append(data.map(f => `<option value="${f.id}" ${f.id == facultyId ? 'selected' : ''}>${f.name}</option>`));
        });
        $('#edit-classroom-modal').modal('show');
    });

    $('#save-edit-classroom').click(function() {
        const name = $('#edit-classroom-name').val();
        const faculty_id = $('#edit-classroom-faculty').val();
        if (!name || !faculty_id) {
            alert('Пожалуйста, заполните все поля аудитории.');
            return;
        }
        const data = {
            name: name,
            faculty_id: parseInt(faculty_id)
        };
        const id = $('#edit-classroom-id').val();
        $.ajax({
            url: `/api/classrooms/${id}/`,
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                alert('Аудитория обновлена!');
                setTimeout(function() {
                    loadClassrooms();
                    loadClassroomsTable();
                    $('#edit-classroom-modal').modal('hide');
                }, 500);
            },
            error: function(xhr) {
                alert('Ошибка обновления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    $(document).on('click', '.delete-classroom', function() {
        if (confirm('Вы уверены, что хотите удалить эту аудиторию?')) {
            const id = $(this).closest('tr').data('id');
            $.ajax({
                url: `/api/classrooms/${id}/`,
                method: 'DELETE',
                success: function() {
                    alert('Аудитория удалена!');
                    setTimeout(function() {
                        loadClassrooms();
                        loadClassroomsTable();
                    }, 500);
                },
                error: function(xhr) {
                    alert('Ошибка удаления: ' + JSON.stringify(xhr.responseJSON));
                }
            });
        }
    });

    return { loadClassroomsTable };
}