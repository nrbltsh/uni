export function setupTeachers(userRole, utils) {
    const { loadTeachers } = utils;

    function loadTeachersTable() {
        $.get('/api/teachers/', function(data) {
            let tbody = $('#teachers-table tbody');
            tbody.empty();
            data.forEach(item => {
                tbody.append(`
                    <tr data-id="${item.id}">
                        <td>${item.last_name || 'Не указано'}</td>
                        <td>${item.first_name || 'Не указано'}</td>
                        <td>${item.middle_name || 'Не указано'}</td>
                        <td data-faculty-id="${item.faculty ? item.faculty.id : ''}">${item.faculty ? item.faculty.name : 'Не указан'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-teacher">Редактировать</button>
                            <button class="btn btn-danger btn-sm delete-teacher">Удалить</button>
                        </td>
                    </tr>
                `);
                if (userRole !== 'manager') {
                    $('.edit-teacher').hide();
                    $('.delete-teacher').hide();
                }
            });
        }).fail(function(xhr) {
            console.error('Ошибка загрузки преподавателей:', xhr.responseJSON);
        });
    }

    $('#add-teacher-form').submit(function(event) {
        event.preventDefault();
        const last_name = $('#teacher-last-name').val();
        const first_name = $('#teacher-first-name').val();
        const middle_name = $('#teacher-middle-name').val();
        const faculty_id = $('#teacher-faculty').val();
        if (!last_name || !first_name || !middle_name || !faculty_id) {
            alert('Пожалуйста, заполните все поля преподавателя, включая выбор факультета.');
            return;
        }
        const data = {
            last_name: last_name,
            first_name: first_name,
            middle_name: middle_name,
            faculty_id: parseInt(faculty_id)
        };
        $.ajax({
            url: '/api/teachers/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                alert('Преподаватель добавлен!');
                setTimeout(function() {
                    loadTeachers();
                    loadTeachersTable();
                    $('#add-teacher-form')[0].reset();
                }, 500);
            },
            error: function(xhr) {
                alert('Ошибка добавления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    $(document).on('click', '.edit-teacher', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        const lastName = row.find('td:eq(0)').text();
        const firstName = row.find('td:eq(1)').text();
        const middleName = row.find('td:eq(2)').text();
        const facultyId = row.find('td:eq(3)').data('faculty-id');
        $('#edit-teacher-id').val(id);
        $('#edit-teacher-last-name').val(lastName);
        $('#edit-teacher-first-name').val(firstName);
        $('#edit-teacher-middle-name').val(middleName);
        $('#edit-teacher-faculty').empty().append('<option value="">Выберите факультет</option>');
        $.get('/api/faculties/', function(data) {
            $('#edit-teacher-faculty').append(data.map(f => `<option value="${f.id}" ${f.id == facultyId ? 'selected' : ''}>${f.name}</option>`));
        });
        $('#edit-teacher-modal').modal('show');
    });

    $('#save-edit-teacher').click(function() {
        const last_name = $('#edit-teacher-last-name').val();
        const first_name = $('#edit-teacher-first-name').val();
        const middle_name = $('#edit-teacher-middle-name').val();
        const faculty_id = $('#edit-teacher-faculty').val();
        if (!last_name || !first_name || !middle_name || !faculty_id) {
            alert('Пожалуйста, заполните все поля преподавателя.');
            return;
        }
        const data = {
            last_name: last_name,
            first_name: first_name,
            middle_name: middle_name,
            faculty_id: parseInt(faculty_id)
        };
        const id = $('#edit-teacher-id').val();
        $.ajax({
            url: `/api/teachers/${id}/`,
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                alert('Преподаватель обновлён!');
                setTimeout(function() {
                    loadTeachers();
                    loadTeachersTable();
                    $('#edit-teacher-modal').modal('hide');
                }, 500);
            },
            error: function(xhr) {
                alert('Ошибка обновления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    $(document).on('click', '.delete-teacher', function() {
        if (confirm('Вы уверены, что хотите удалить этого преподавателя?')) {
            const id = $(this).closest('tr').data('id');
            $.ajax({
                url: `/api/teachers/${id}/`,
                method: 'DELETE',
                success: function() {
                    alert('Преподаватель удалён!');
                    setTimeout(function() {
                        loadTeachers();
                        loadTeachersTable();
                    }, 500);
                },
                error: function(xhr) {
                    alert('Ошибка удаления: ' + JSON.stringify(xhr.responseJSON));
                }
            });
        }
    });

    return { loadTeachersTable };
}