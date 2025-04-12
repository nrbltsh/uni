export function setupSubjects(userRole, utils) {
    const { loadSubjects, loadFacultiesIntoSelect } = utils;

    function loadSubjectsTable() {
        $.get('/api/subjects/', function(data) {
            let tbody = $('#subjects-table tbody');
            tbody.empty();
            data.forEach(item => {
                tbody.append(`
                    <tr data-id="${item.id}">
                        <td>${item.name}</td>
                        <td data-faculty-id="${item.faculty ? item.faculty.id : ''}">${item.faculty ? item.faculty.name : 'Не указан'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-subject">Редактировать</button>
                            <button class="btn btn-danger btn-sm delete-subject">Удалить</button>
                        </td>
                    </tr>
                `);
                if (userRole !== 'manager') {
                    $('.edit-subject').hide();
                    $('.delete-subject').hide();
                }
            });
        }).fail(function(xhr) {
            console.error('Ошибка загрузки предметов:', xhr.responseJSON);
        });
    }

    $('#add-subject-form').submit(function(event) {
        event.preventDefault();
        const name = $('#subject-name').val();
        const faculty_id = $('#subject-faculty').val();
        if (!name || !faculty_id) {
            alert('Пожалуйста, заполните все поля предмета, включая выбор факультета.');
            return;
        }
        const data = {
            name: name,
            faculty_id: parseInt(faculty_id)
        };
        $.ajax({
            url: '/api/subjects/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                alert('Предмет добавлен!');
                setTimeout(function() {
                    loadSubjects();
                    loadSubjectsTable();
                    $('#add-subject-form')[0].reset();
                }, 500);
            },
            error: function(xhr) {
                alert('Ошибка добавления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    $(document).on('click', '.edit-subject', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        const name = row.find('td:eq(0)').text();
        const facultyId = row.find('td:eq(1)').data('faculty-id');

        const editContainer = `
            <div id="edit-subject-container">
                <div class="mb-3">
                    <label for="edit-subject-name" class="form-label">Название предмета</label>
                    <input type="text" class="form-control" id="edit-subject-name" value="${name}" required>
                </div>
                <div class="mb-3">
                    <label for="edit-subject-faculty" class="form-label">Факультет</label>
                    <select id="edit-subject-faculty" class="form-select" required></select>
                </div>
                <button class="btn btn-primary save-edit-subject" data-id="${id}">Сохранить</button>
                <button class="btn btn-secondary cancel-edit-subject">Отмена</button>
            </div>
        `;

        row.html(`<td colspan="3">${editContainer}</td>`);

        loadFacultiesIntoSelect('#edit-subject-faculty');
        $('#edit-subject-faculty').val(facultyId);
    });

    $(document).on('click', '.save-edit-subject', function() {
        const id = $(this).data('id');
        const newName = $('#edit-subject-name').val();
        const faculty_id = $('#edit-subject-faculty').val();

        if (!newName || !faculty_id) {
            alert('Пожалуйста, заполните все поля предмета.');
            return;
        }

        $.ajax({
            url: `/api/subjects/${id}/`,
            method: 'PUT',
            data: JSON.stringify({
                name: newName,
                faculty_id: parseInt(faculty_id)
            }),
            contentType: 'application/json',
            success: function() {
                alert('Предмет обновлён!');
                setTimeout(function() {
                    loadSubjects();
                    loadSubjectsTable();
                }, 500);
            },
            error: function(xhr) {
                alert('Ошибка обновления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    $(document).on('click', '.cancel-edit-subject', function() {
        loadSubjectsTable();
    });

    $(document).on('click', '.delete-subject', function() {
        if (confirm('Вы уверены, что хотите удалить этот предмет?')) {
            const id = $(this).closest('tr').data('id');
            $.ajax({
                url: `/api/subjects/${id}/`,
                method: 'DELETE',
                success: function() {
                    alert('Предмет удалён!');
                    setTimeout(function() {
                        loadSubjects();
                        loadSubjectsTable();
                    }, 500);
                },
                error: function(xhr) {
                    alert('Ошибка удаления: ' + JSON.stringify(xhr.responseJSON));
                }
            });
        }
    });

    return { loadSubjectsTable };
}