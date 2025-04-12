export function setupSchedule(userRole, token, utils) {
    const { loadFaculties, loadGroups, loadSubjects, loadTeachers, loadClassrooms } = utils;

    // Показать форму добавления занятия
    $('#show-add-form').click(function() {
        $('#add-schedule-container').toggle();
        $('#subjects-container').hide();
        $('#faculties-container').hide();
        $('#teachers-container').hide();
        $('#classrooms-container').hide();
        $('#groups-container').hide();
    });

    // Фильтрация по факультету
    $('#filter-faculty').change(function() {
        let facultyId = $(this).val();
        $('#filter-group').empty().append('<option value="">Выберите группу</option>');
        if (facultyId) {
            $.get(`/api/groups/?faculty_id=${facultyId}`, function(data) {
                console.log('Группы загружены для факультета:', facultyId, data);
                $('#filter-group').append(data.map(g => `<option value="${g.id}">${g.name}</option>`));
            }).fail(function(xhr) {
                console.error('Ошибка загрузки групп по факультету:', xhr.responseJSON);
            });
        }
    });

    // Функция проверки конфликтов
    function checkConflicts(day, startTime, endTime, teacherId, classroomId, excludeId = null) {
        return new Promise((resolve) => {
            $.get('/api/schedule/', function(data) {
                console.log('Проверка конфликтов, данные расписания:', data);
                const conflicts = data.filter(item => {
                    // Пропускаем занятие, если это редактируемое занятие (чтобы не конфликтовать с самим собой)
                    if (excludeId && item.id === excludeId) return false;

                    // Проверяем совпадение дня
                    if (item.day_of_week !== day) return false;

                    // Проверяем пересечение времени
                    const existingStart = item.start_time;
                    const existingEnd = item.end_time;
                    const newStart = startTime;
                    const newEnd = endTime;

                    const isTimeConflict = !(newEnd <= existingStart || newStart >= existingEnd);

                    // Проверяем конфликт преподавателя или аудитории
                    const teacherConflict = isTimeConflict && item.teacher.id === teacherId;
                    const classroomConflict = isTimeConflict && item.classroom.id === classroomId;

                    return teacherConflict || classroomConflict;
                });

                if (conflicts.length > 0) {
                    const conflictMessages = conflicts.map(item => {
                        const teacherConflict = item.teacher.id === teacherId;
                        const classroomConflict = item.classroom.id === classroomId;
                        let message = `Конфликт в ${item.day_of_week} с ${item.start_time.slice(0, 5)} до ${item.end_time.slice(0, 5)}: `;
                        if (teacherConflict) {
                            message += `Преподаватель ${item.teacher.last_name} ${item.teacher.first_name} уже занят. `;
                        }
                        if (classroomConflict) {
                            message += `Аудитория ${item.classroom.name} уже занята.`;
                        }
                        return message;
                    });
                    resolve({ hasConflict: true, messages: conflictMessages });
                } else {
                    resolve({ hasConflict: false });
                }
            }).fail(function(xhr) {
                console.error('Ошибка проверки конфликтов:', xhr.responseJSON);
                resolve({ hasConflict: false }); // В случае ошибки продолжаем без проверки
            });
        });
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

            // Проверяем, есть ли данные
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
                // Пропускаем воскресенье
                if (item.day_of_week === 'sun') {
                    console.log('Пропускаем занятие на воскресенье:', item);
                    return;
                }

                // Если day_of_week некорректен, используем 'mon' по умолчанию
                const day = (item.day_of_week && ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(item.day_of_week)) ? item.day_of_week : 'mon';
                console.log(`Используем день: ${day} для занятия`, item);

                const tbody = $(`#schedule-${day}`);
                if (!tbody.length) {
                    console.warn(`Таблица для дня ${day} не найдена`);
                    return;
                }

                // Проверяем наличие всех необходимых полей
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
        }).fail(function(xhr) {
            console.error('Ошибка загрузки расписания:', xhr.responseJSON);
            if (xhr.status === 401) {
                localStorage.removeItem('access_token');
                userRole = null;
                $('#login-form').show();
                $('#register-form').show();
                $('#schedule-content').hide();
            }
        });
    }

    $('#filter-group').change(function() {
        let groupId = $(this).val();
        console.log('Изменён filter-group, groupId:', groupId);
        loadSchedule(groupId);
    });

    $('#group').change(function() {
        const groupId = $(this).val();
        if (groupId) {
            const facultyId = $(`#group option[value="${groupId}"]`).data('faculty-id');
            loadSubjects(facultyId);
            loadTeachers(facultyId);
            loadClassrooms(facultyId);
        } else {
            loadSubjects();
            loadTeachers();
            loadClassrooms();
        }
    });

    $('#edit-group').change(function() {
        const groupId = $(this).val();
        if (groupId) {
            const facultyId = $(`#edit-group option[value="${groupId}"]`).data('faculty-id');
            loadSubjects(facultyId);
            loadTeachers(facultyId);
            loadClassrooms(facultyId);
        } else {
            loadSubjects();
            loadTeachers();
            loadClassrooms();
        }
    });

    // Добавление занятия с проверкой конфликтов
    $('#add-schedule-form').submit(async function(event) {
        event.preventDefault();

        const startTime = $('#start_time').val();
        const endTime = $('#end_time').val();
        const groupId = $('#group').val();
        const subjectId = $('#subject').val();
        const teacherId = $('#teacher').val();
        const classroomId = $('#classroom').val();
        const day = $('#day_of_week').val();

        if (!groupId || !subjectId || !teacherId || !classroomId || !startTime || !endTime) {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        // Проверяем конфликты
        const conflictResult = await checkConflicts(day, `${startTime}:00`, `${endTime}:00`, parseInt(teacherId), parseInt(classroomId));
        if (conflictResult.hasConflict) {
            alert('Обнаружен конфликт:\n' + conflictResult.messages.join('\n'));
            return;
        }

        const data = {
            day_of_week: day,
            group_id: groupId,
            subject_id: subjectId,
            teacher_id: teacherId,
            classroom_id: classroomId,
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`
        };

        console.log('Добавление занятия:', data);
        $.ajax({
            url: '/api/schedule/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                alert('Занятие успешно добавлено!');
                loadSchedule($('#filter-group').val());
                $('#add-schedule-form')[0].reset();
                $('#add-schedule-container').hide();
            },
            error: function(xhr) {
                alert('Ошибка добавления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    // Редактирование занятия с проверкой конфликтов
    $(document).on('click', '.edit-schedule', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        $.get(`/api/schedule/${id}/`, function(data) {
            $('#edit-id').val(data.id);
            $('#edit-day_of_week').val(data.day_of_week);
            $('#edit-group').val(data.group.id);
            $('#edit-subject').val(data.subject.id);
            $('#edit-teacher').val(data.teacher.id);
            $('#edit-classroom').val(data.classroom.id);
            $('#edit-start_time').val(data.start_time.slice(0, 5));
            $('#edit-end_time').val(data.end_time.slice(0, 5));

            const facultyId = $(`#edit-group option[value="${data.group.id}"]`).data('faculty-id');
            loadSubjects(facultyId);
            loadTeachers(facultyId);
            loadClassrooms(facultyId);

            $('#edit-schedule-modal').modal('show');
        });
    });

    $('#save-edit').click(async function() {
        const startTime = $('#edit-start_time').val();
        const endTime = $('#edit-end_time').val();
        const groupId = $('#edit-group').val();
        const subjectId = $('#edit-subject').val();
        const teacherId = $('#edit-teacher').val();
        const classroomId = $('#edit-classroom').val();
        const day = $('#edit-day_of_week').val();
        const id = $('#edit-id').val();

        if (!groupId || !subjectId || !teacherId || !classroomId || !startTime || !endTime) {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        // Проверяем конфликты
        const conflictResult = await checkConflicts(day, `${startTime}:00`, `${endTime}:00`, parseInt(teacherId), parseInt(classroomId), parseInt(id));
        if (conflictResult.hasConflict) {
            alert('Обнаружен конфликт:\n' + conflictResult.messages.join('\n'));
            return;
        }

        const data = {
            day_of_week: day,
            group_id: groupId,
            subject_id: subjectId,
            teacher_id: teacherId,
            classroom_id: classroomId,
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`
        };

        console.log('Обновление занятия:', data);
        $.ajax({
            url: `/api/schedule/${id}/`,
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                alert('Занятие обновлено!');
                loadSchedule($('#filter-group').val());
                $('#edit-schedule-modal').modal('hide');
            },
            error: function(xhr) {
                alert('Ошибка обновления: ' + JSON.stringify(xhr.responseJSON));
            }
        });
    });

    // Удаление занятия
    $(document).on('click', '.delete-schedule', function() {
        if (confirm('Вы уверены, что хотите удалить это занятие?')) {
            const id = $(this).closest('tr').data('id');
            $.ajax({
                url: `/api/schedule/${id}/`,
                method: 'DELETE',
                success: function() {
                    alert('Занятие удалено!');
                    loadSchedule($('#filter-group').val());
                },
                error: function(xhr) {
                    alert('Ошибка удаления: ' + JSON.stringify(xhr.responseJSON));
                }
            });
        }
    });

    // Скрытие кнопок для не-менеджеров
    if (userRole !== 'manager') {
        $('#show-add-form').hide();
        $('.edit-schedule').hide();
        $('.delete-schedule').hide();
    }
}