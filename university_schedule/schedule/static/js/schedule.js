export function setupSchedule(userRole, token, utils) {
    const { loadFaculties, loadGroups, loadSubjects, loadTeachers, loadClassrooms, refreshToken } = utils;

    // Показать форму добавления занятия
    $('#show-add-form').click(function() {
        $('#add-schedule-container').toggle();
        $('#subjects-container').hide();
        $('#faculties-container').hide();
        $('#teachers-container').hide();
        $('#classrooms-container').hide();
        $('#groups-container').hide();
        console.log('Открытие формы добавления занятия');
        loadGroups();
        const groupId = $('#group').val();
        if (groupId) {
            const facultyId = $(`#group option[value="${groupId}"]`).data('faculty-id');
            console.log('Начальный выбор группы, facultyId:', facultyId);
            if (facultyId && facultyId !== 'undefined' && facultyId !== '') {
                loadSubjects(facultyId);
                loadTeachers(facultyId);
                loadClassrooms(facultyId);
            } else {
                console.warn('facultyId не определён, загружаем все данные');
                loadSubjects();
                loadTeachers();
                loadClassrooms();
            }
        } else {
            loadSubjects();
            loadTeachers();
            loadClassrooms();
        }
    });

    // Фильтрация по факультету
    $('#filter-faculty').change(function() {
        let facultyId = $(this).val();
        console.log('Изменён фильтр факультета, facultyId:', facultyId);
        $('#filter-group').empty().append('<option value="">Выберите группу</option>');
        if (facultyId && facultyId !== 'undefined' && facultyId !== '') {
            $.get(`/api/groups/?faculty_id=${facultyId}`, function(data) {
                console.log('Группы загружены для факультета:', facultyId, data);
                $('#filter-group').append(data.map(g => `<option value="${g.id}" data-faculty-id="${g.faculty ? g.faculty.id : ''}">${g.name}</option>`));
            }).fail(function(xhr) {
                console.error('Ошибка загрузки групп:', xhr.responseJSON);
                const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
                alert(`Ошибка загрузки групп: ${errorMessage}`);
            });
            loadSubjects(facultyId);
            loadTeachers(facultyId);
            loadClassrooms(facultyId);
        } else {
            loadGroups();
            loadSubjects();
            loadTeachers();
            loadClassrooms();
        }
    });

    // Функция проверки конфликтов
    async function checkConflicts(day, startTime, endTime, teacherId, classroomId, excludeId = null) {
        try {
            const response = await $.get('/api/schedule/');
            const data = response;
            console.log('Проверка конфликтов, данные расписания:', data);
            const conflicts = data.filter(item => {
                if (excludeId && item.id === excludeId) return false;
                if (item.day_of_week !== day) return false;

                const existingStart = item.start_time;
                const existingEnd = item.end_time;
                const newStart = startTime;
                const newEnd = endTime;

                const isTimeConflict = !(newEnd <= existingStart || newStart >= existingEnd);
                const teacherConflict = isTimeConflict && item.teacher.id === parseInt(teacherId);
                const classroomConflict = isTimeConflict && item.classroom.id === parseInt(classroomId);

                return teacherConflict || classroomConflict;
            });

            if (conflicts.length > 0) {
                const conflictMessages = conflicts.map(item => {
                    const teacherConflict = item.teacher.id === parseInt(teacherId);
                    const classroomConflict = item.classroom.id === parseInt(classroomId);
                    let message = `Конфликт в ${item.day_of_week} с ${item.start_time.slice(0, 5)} до ${item.end_time.slice(0, 5)}: `;
                    if (teacherConflict) {
                        message += `Преподаватель ${item.teacher.last_name} ${item.teacher.first_name} уже занят. `;
                    }
                    if (classroomConflict) {
                        message += `Аудитория ${item.classroom.name} уже занята.`;
                    }
                    return message;
                });
                return { hasConflict: true, messages: conflictMessages };
            }
            return { hasConflict: false };
        } catch (xhr) {
            console.error('Ошибка проверки конфликтов:', xhr.responseJSON);
            const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
            alert(`Ошибка проверки конфликтов: ${errorMessage}`);
            return { hasConflict: false };
        }
    }

    // Загрузка расписания
    function loadSchedule(groupId = '') {
        console.log('Вызов loadSchedule с groupId:', groupId);
        if (!groupId) {
            console.log('groupId не указан, скрываем таблицу расписания');
            $('#schedule-table-container').hide();
            return;
        }
        const url = `/api/schedule/?group_id=${groupId}`;
        console.log('Запрос расписания по URL:', url);
        $.get(url, function(data) {
            console.log('Данные расписания получены:', data);
            $('#schedule-mon, #schedule-tue, #schedule-wed, #schedule-thu, #schedule-fri, #schedule-sat').empty();
            $('.self-study-message').hide();
            $('.day-section').show();

            if (!data || data.length === 0) {
                console.log('Данные расписания пусты или отсутствуют');
                $('.day-section').each(function() {
                    const tbody = $(this).find('tbody');
                    const selfStudyMessage = $(this).find('.self-study-message');
                    const table = $(this).find('table');
                    table.hide();
                    selfStudyMessage.show();
                });
                $('#schedule-table-container').show();
                console.log('Таблица расписания показана (пустая)');
                return;
            }

            data.sort((a, b) => a.start_time.localeCompare(b.start_time));

            data.forEach(item => {
                if (!['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(item.day_of_week)) {
                    console.log('Пропускаем занятие с некорректным днём:', item);
                    return;
                }

                const tbody = $(`#schedule-${item.day_of_week}`);
                if (!tbody.length) {
                    console.warn(`Таблица для дня ${item.day_of_week} не найдена`);
                    return;
                }

                if (!item.group || !item.subject || !item.teacher || !item.classroom || !item.start_time || !item.end_time) {
                    console.warn('Некорректные данные занятия, пропускаем:', item);
                    return;
                }

                tbody.append(`
                    <tr data-id="${item.id}">
                        <td>${item.group.name || 'Не указано'}</td>
                        <td>${item.subject.name || 'Не указано'}</td>
                        <td>${item.teacher.last_name || ''} ${item.teacher.first_name || ''} ${item.teacher.middle_name || ''}</td>
                        <td>${item.classroom.name || 'Не указано'}</td>
                        <td>${item.start_time.slice(0, 5) || 'Не указано'}</td>
                        <td>${item.end_time.slice(0, 5) || 'Не указано'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-schedule">Редактировать</button>
                            <button class="btn btn-danger btn-sm delete-schedule">Удалить</button>
                        </td>
                    </tr>
                `);
            });

            $('.day-section').each(function() {
                const tbody = $(this).find('tbody');
                const selfStudyMessage = $(this).find('.self-study-message');
                const table = $(this).find('table');
                if (tbody.children().length === 0) {
                    table.hide();
                    selfStudyMessage.show();
                } else {
                    table.show();
                    selfStudyMessage.hide();
                }
            });

            $('#schedule-table-container').show();
            console.log('Таблица расписания показана');

            if (userRole !== 'manager') {
                $('.edit-schedule').hide();
                $('.delete-schedule').hide();
            }
        }).fail(async function(xhr) {
            console.error('Ошибка загрузки расписания:', xhr.responseJSON);
            if (xhr.status === 401) {
                try {
                    await refreshToken();
                    loadSchedule(groupId);
                } catch (e) {
                    alert('Сессия истекла. Пожалуйста, войдите снова.');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    $('#login-form').show();
                    $('#register-form').show();
                    $('#schedule-content').hide();
                }
            } else {
                const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
                alert(`Ошибка загрузки расписания: ${errorMessage}`);
            }
        });
    }

    // Обработчик изменения группы в фильтре
    $('#filter-group').change(function() {
        let groupId = $(this).val();
        console.log('Изменён filter-group, groupId:', groupId);
        loadSchedule(groupId);
    });

    // Обработчик изменения группы в форме добавления
    $('#group').change(function() {
        const groupId = $(this).val();
        console.log('Изменён group, groupId:', groupId);
        if (groupId) {
            const facultyId = $(`#group option[value="${groupId}"]`).data('faculty-id');
            console.log('Group changed, facultyId:', facultyId);
            if (facultyId && facultyId !== 'undefined' && facultyId !== '') {
                loadSubjects(facultyId);
                loadTeachers(facultyId);
                loadClassrooms(facultyId);
            } else {
                console.warn('facultyId не определён, загружаем все данные');
                loadSubjects();
                loadTeachers();
                loadClassrooms();
            }
        } else {
            loadSubjects();
            loadTeachers();
            loadClassrooms();
        }
    });

    // Обработчик изменения группы в форме редактирования
    $('#edit-group').change(function() {
        const groupId = $(this).val();
        console.log('Изменён edit-group, groupId:', groupId);
        if (groupId) {
            const facultyId = $(`#edit-group option[value="${groupId}"]`).data('faculty-id');
            console.log('Edit group changed, facultyId:', facultyId);
            if (facultyId && facultyId !== 'undefined' && facultyId !== '') {
                loadSubjects(facultyId);
                loadTeachers(facultyId);
                loadClassrooms(facultyId);
            } else {
                console.warn('facultyId не определён, загружаем все данные');
                loadSubjects();
                loadTeachers();
                loadClassrooms();
            }
        } else {
            loadSubjects();
            loadTeachers();
            loadClassrooms();
        }
    });

    // Добавление занятия
    $('#add-schedule-form').submit(async function(event) {
        event.preventDefault();

        const startTime = $('#start_time').val();
        const endTime = $('#end_time').val();
        const groupId = $('#group').val();
        const subjectId = $('#subject').val();
        const teacherId = $('#teacher').val();
        const classroomId = $('#classroom').val();
        const day = $('#day_of_week').val();

        if (!groupId || !subjectId || !teacherId || !classroomId || !startTime || !endTime || !day) {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        if (startTime >= endTime) {
            alert('Время окончания должно быть позже времени начала.');
            return;
        }

        const conflictResult = await checkConflicts(day, `${startTime}:00`, `${endTime}:00`, teacherId, classroomId);
        if (conflictResult.hasConflict) {
            alert('Обнаружен конфликт:\n' + conflictResult.messages.join('\n'));
            return;
        }

        const data = {
            day_of_week: day,
            group: parseInt(groupId),
            subject: parseInt(subjectId),
            teacher: parseInt(teacherId),
            classroom: parseInt(classroomId),
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`
        };

        console.log('Добавление занятия:', data);
        $.ajax({
            url: '/api/schedule/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
            success: function(response) {
                console.log('Занятие добавлено:', response);
                alert('Занятие успешно добавлено!');
                loadSchedule($('#filter-group').val());
                $('#add-schedule-form')[0].reset();
                $('#add-schedule-container').hide();
            },
            error: async function(xhr) {
                console.error('Ошибка добавления занятия:', xhr.responseJSON);
                if (xhr.status === 401) {
                    try {
                        await refreshToken();
                        $.ajax({
                            url: '/api/schedule/',
                            method: 'POST',
                            data: JSON.stringify(data),
                            contentType: 'application/json',
                            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
                            success: function() {
                                alert('Занятие успешно добавлено!');
                                loadSchedule($('#filter-group').val());
                                $('#add-schedule-form')[0].reset();
                                $('#add-schedule-container').hide();
                            },
                            error: function(xhr) {
                                const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
                                alert(`Ошибка добавления: ${errorMessage}`);
                            }
                        });
                    } catch (e) {
                        alert('Сессия истекла. Пожалуйста, войдите снова.');
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        $('#login-form').show();
                        $('#register-form').show();
                        $('#schedule-content').hide();
                    }
                } else {
                    const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
                    alert(`Ошибка добавления: ${errorMessage}`);
                }
            }
        });
    });

    // Редактирование занятия
    $(document).on('click', '.edit-schedule', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        console.log('Редактирование занятия, id:', id);
        $.get(`/api/schedule/${id}/`, function(data) {
            $('#edit-id').val(data.id);
            $('#edit-day_of_week').val(data.day_of_week);
            loadGroups();
            setTimeout(() => {
                $('#edit-group').val(data.group.id);
                const facultyId = $(`#edit-group option[value="${data.group.id}"]`).data('faculty-id');
                console.log('Loading edit form, facultyId:', facultyId);
                if (facultyId && facultyId !== 'undefined' && facultyId !== '') {
                    loadSubjects(facultyId);
                    loadTeachers(facultyId);
                    loadClassrooms(facultyId);
                } else {
                    console.warn('facultyId не определён для редактирования, загружаем все данные');
                    loadSubjects();
                    loadTeachers();
                    loadClassrooms();
                }
                setTimeout(() => {
                    $('#edit-subject').val(data.subject.id);
                    $('#edit-teacher').val(data.teacher.id);
                    $('#edit-classroom').val(data.classroom.id);
                    $('#edit-start_time').val(data.start_time.slice(0, 5));
                    $('#edit-end_time').val(data.end_time.slice(0, 5));
                    $('#edit-schedule-modal').modal('show');
                }, 500);
            }, 500);
        }).fail(function(xhr) {
            console.error('Ошибка загрузки данных занятия:', xhr.responseJSON);
            const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
            alert(`Ошибка загрузки данных: ${errorMessage}`);
        });
    });

    // Сохранение изменений занятия
    $('#save-edit').click(async function() {
        const id = $('#edit-id').val();
        const startTime = $('#edit-start_time').val();
        const endTime = $('#edit-end_time').val();
        const groupId = $('#edit-group').val();
        const subjectId = $('#edit-subject').val();
        const teacherId = $('#edit-teacher').val();
        const classroomId = $('#edit-classroom').val();
        const day = $('#edit-day_of_week').val();

        if (!groupId || !subjectId || !teacherId || !classroomId || !startTime || !endTime || !day) {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        if (startTime >= endTime) {
            alert('Время окончания должно быть позже времени начала.');
            return;
        }

        const conflictResult = await checkConflicts(day, `${startTime}:00`, `${endTime}:00`, teacherId, classroomId, parseInt(id));
        if (conflictResult.hasConflict) {
            alert('Обнаружен конфликт:\n' + conflictResult.messages.join('\n'));
            return;
        }

        const data = {
            day_of_week: day,
            group: parseInt(groupId),
            subject: parseInt(subjectId),
            teacher: parseInt(teacherId),
            classroom: parseInt(classroomId),
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`
        };

        console.log('Обновление занятия:', data);
        $.ajax({
            url: `/api/schedule/${id}/`,
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
            success: function(response) {
                console.log('Занятие обновлено:', response);
                alert('Занятие успешно обновлено!');
                loadSchedule($('#filter-group').val());
                $('#edit-schedule-modal').modal('hide');
            },
            error: async function(xhr) {
                console.error('Ошибка обновления занятия:', xhr.responseJSON);
                if (xhr.status === 401) {
                    try {
                        await refreshToken();
                        $.ajax({
                            url: `/api/schedule/${id}/`,
                            method: 'PUT',
                            data: JSON.stringify(data),
                            contentType: 'application/json',
                            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
                            success: function() {
                                alert('Занятие успешно обновлено!');
                                loadSchedule($('#filter-group').val());
                                $('#edit-schedule-modal').modal('hide');
                            },
                            error: function(xhr) {
                                const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
                                alert(`Ошибка обновления: ${errorMessage}`);
                            }
                        });
                    } catch (e) {
                        alert('Сессия истекла. Пожалуйста, войдите снова.');
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        $('#login-form').show();
                        $('#register-form').show();
                        $('#schedule-content').hide();
                    }
                } else {
                    const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
                    alert(`Ошибка обновления: ${errorMessage}`);
                }
            }
        });
    });

    // Удаление занятия
    $(document).on('click', '.delete-schedule', function() {
        if (confirm('Вы уверены, что хотите удалить это занятие?')) {
            const id = $(this).closest('tr').data('id');
            console.log('Удаление занятия, id:', id);
            $.ajax({
                url: `/api/schedule/${id}/`,
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
                success: function() {
                    alert('Занятие удалено!');
                    loadSchedule($('#filter-group').val());
                },
                error: async function(xhr) {
                    console.error('Ошибка удаления занятия:', xhr.responseJSON);
                    if (xhr.status === 401) {
                        try {
                            await refreshToken();
                            $.ajax({
                                url: `/api/schedule/${id}/`,
                                method: 'DELETE',
                                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
                                success: function() {
                                    alert('Занятие удалено!');
                                    loadSchedule($('#filter-group').val());
                                },
                                error: function(xhr) {
                                    const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
                                    alert(`Ошибка удаления: ${errorMessage}`);
                                }
                            });
                        } catch (e) {
                            alert('Сессия истекла. Пожалуйста, войдите снова.');
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            $('#login-form').show();
                            $('#register-form').show();
                            $('#schedule-content').hide();
                        }
                    } else {
                        const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
                        alert(`Ошибка удаления: ${errorMessage}`);
                    }
                }
            });
        }
    });

    // Инициализация
    console.log('Инициализация schedule.js, userRole:', userRole);
    loadFaculties();
    loadGroups();
    $('#schedule-table-container').hide();

    if (userRole !== 'manager') {
        $('#show-add-form').hide();
    }
}