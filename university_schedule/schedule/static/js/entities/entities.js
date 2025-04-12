export function setupEntities(userRole, token, utils) {
    const { loadFaculties, loadGroups, loadSubjects, loadTeachers, loadClassrooms, refreshToken } = utils;

    // Функции для загрузки таблиц
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

    function loadFacultiesTable() {
        $.get('/api/faculties/', function(data) {
            let tbody = $('#faculties-table tbody');
            tbody.empty();
            data.forEach(item => {
                tbody.append(`
                    <tr data-id="${item.id}">
                        <td>${item.name}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-faculty">Редактировать</button>
                            <button class="btn btn-danger btn-sm delete-faculty">Удалить</button>
                        </td>
                    </tr>
                `);
                if (userRole !== 'manager') {
                    $('.edit-faculty').hide();
                    $('.delete-faculty').hide();
                }
            });
        }).fail(function(xhr) {
            console.error('Ошибка загрузки факультетов:', xhr.responseJSON);
        });
    }

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

    // Инициализация таблиц
    loadSubjectsTable();
    loadTeachersTable();
    loadClassroomsTable();
    loadFacultiesTable();
    loadGroupsTable();

    // Обработчики для кнопок переключения форм
    $('#show-subjects').click(function() {
        $('#subjects-container').toggle();
        $('#add-schedule-container').hide();
        $('#faculties-container').hide();
        $('#teachers-container').hide();
        $('#classrooms-container').hide();
        $('#groups-container').hide();
        loadFacultiesIntoSelect('#subject-faculty');
    });

    $('#show-faculties').click(function() {
        $('#faculties-container').toggle();
        $('#teachers-container').hide();
        $('#classrooms-container').hide();
        $('#groups-container').hide();
        $('#add-schedule-container').hide();
        $('#subjects-container').hide();
    });

    $('#show-teachers').click(function() {
        $('#teachers-container').toggle();
        $('#faculties-container').hide();
        $('#classrooms-container').hide();
        $('#groups-container').hide();
        $('#add-schedule-container').hide();
        $('#subjects-container').hide();
        loadFacultiesIntoSelect('#teacher-faculty');
    });

    $('#show-classrooms').click(function() {
        $('#classrooms-container').toggle();
        $('#faculties-container').hide();
        $('#teachers-container').hide();
        $('#groups-container').hide();
        $('#add-schedule-container').hide();
        $('#subjects-container').hide();
        loadFacultiesIntoSelect('#classroom-faculty');
    });

    $('#show-groups').click(function() {
        $('#groups-container').toggle();
        $('#faculties-container').hide();
        $('#teachers-container').hide();
        $('#classrooms-container').hide();
        $('#add-schedule-container').hide();
        $('#subjects-container').hide();
        loadFacultiesIntoSelect('#group-faculty');
    });

    // Скрытие кнопок для не-менеджеров
    if (userRole !== 'manager') {
        $('#show-subjects').hide();
        $('#show-faculties').hide();
        $('#show-teachers').hide();
        $('#show-classrooms').hide();
        $('#show-groups').hide();
    }

    // Работа с предметами
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
        console.log('Добавление предмета:', data);
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

    // Работа с преподавателями
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
        console.log('Добавление преподавателя:', data);
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
        console.log('Обновление преподавателя:', data);
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

    // Работа с аудиториями
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
        console.log('Добавление аудитории:', data);
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
        console.log('Обновление аудитории:', data);
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

    // Работа с факультетами
    $('#add-faculty-form').submit(function(event) {
        event.preventDefault();
        const name = $('#faculty-name').val();
        if (!name) {
            alert('Пожалуйста, введите название факультета.');
            return;
        }
        const data = { name: name };
        console.log('Добавление факультета:', data);
        $.ajax({
            url: '/api/faculties/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                alert('Факультет добавлен!');
                setTimeout(function() {
                    loadFaculties();
                    loadFacultiesTable();
                    loadGroups();
                    loadGroupsTable();
                    $('#add-faculty-form')[0].reset();
                }, 500);
            },
            error: function(xhr) {
                alert('Ошибка добавления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    $(document).on('click', '.edit-faculty', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        const name = row.find('td:first').text();
        const newName = prompt('Введите новое название факультета:', name);
        if (newName) {
            $.ajax({
                url: `/api/faculties/${id}/`,
                method: 'PUT',
                data: JSON.stringify({ name: newName }),
                contentType: 'application/json',
                success: function() {
                    alert('Факультет обновлён!');
                    setTimeout(function() {
                        loadFaculties();
                        loadFacultiesTable();
                        loadGroups();
                        loadGroupsTable();
                    }, 500);
                },
                error: function(xhr) {
                    alert('Ошибка обновления: ' + JSON.stringify(xhr.responseJSON));
                }
            });
        }
    });

    $(document).on('click', '.delete-faculty', function() {
        if (confirm('Вы уверены, что хотите удалить этот факультет?')) {
            const id = $(this).closest('tr').data('id');
            $.ajax({
                url: `/api/faculties/${id}/`,
                method: 'DELETE',
                success: function() {
                    alert('Факультет удалён!');
                    setTimeout(function() {
                        loadFaculties();
                        loadFacultiesTable();
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

    // Работа с группами
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
        console.log('Добавление группы:', data);
        $.ajax({
            url: '/api/groups/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                console.log('Группа успешно добавлена:', response);
                alert('Группа добавлена!');
                setTimeout(function() {
                    loadGroups();
                    loadGroupsTable();
                    $('#add-group-form')[0].reset();
                }, 500);
            },
            error: function(xhr) {
                console.log('Ошибка добавления группы:', xhr.responseJSON);
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
        console.log('Обновление группы:', data);
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

    // Вспомогательная функция для загрузки факультетов в select
    function loadFacultiesIntoSelect(selectId) {
        $.get('/api/faculties/', function(data) {
            $(selectId).empty().append('<option value="">Выберите факультет</option>')
                .append(data.map(f => `<option value="${f.id}">${f.name}</option>`));
        }).fail(function(xhr) {
            console.error('Ошибка загрузки факультетов:', xhr.responseJSON);
        });
    }
}