export function handleAuth(token, userRole, setupSchedule, setupEntities, utils) {
    const { loadFaculties, loadGroups, loadSubjects, loadTeachers, loadClassrooms, refreshToken } = utils;

    function showSchedule() {
        console.log('Вызов showSchedule, userRole:', userRole);
        $('#login-form').hide();
        $('#schedule-content').show();
        $('#schedule-table-container').hide();

        // Инициализация модулей расписания и сущностей
        setupSchedule(userRole, token, utils);
        setupEntities(userRole, token, utils);

        // Загрузка данных
        loadFaculties();
        loadGroups();
        loadSubjects();
        loadTeachers();
        loadClassrooms();

        // Автоматически выбираем первую группу и загружаем расписание
        $.get('/api/groups/', function(data) {
            console.log('Группы для автоматического выбора:', data);
            if (data.length > 0) {
                const firstGroupId = data[0].id;
                console.log('Автоматически выбрана первая группа:', firstGroupId);
                $('#filter-group').val(firstGroupId).trigger('change');
            } else {
                console.log('Группы отсутствуют, расписание не будет загружено');
            }
        }).fail(function(xhr) {
            console.error('Ошибка автоматической загрузки групп:', xhr.responseJSON);
        });
    }

    // Проверка токена при загрузке страницы
    if (token) {
        console.log('Токен найден, проверяем роль пользователя');
        $.get('/api/user-role/', function(data) {
            userRole = data.role;
            console.log('Роль пользователя:', userRole);
            showSchedule();
        }).fail(function(xhr) {
            console.error('Ошибка получения роли пользователя:', xhr.responseJSON);
        });
    } else {
        console.log('Токен не найден, показываем форму входа');
        $('#login-form').show();
        $('#schedule-content').hide();
    }

    // Обработчик формы входа
    $('#login-form form').submit(function(event) {
        event.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();
        $.ajax({
            url: '/api/token/',
            method: 'POST',
            data: { username: username, password: password },
            success: function(data) {
                token = data.access;
                localStorage.setItem('access_token', token);
                $.ajaxSetup({ headers: { 'Authorization': 'Bearer ' + token } });
                $.get('/api/user-role/', function(data) {
                    userRole = data.role;
                    console.log('Роль пользователя после входа:', userRole);
                    showSchedule();
                }).fail(function(xhr) {
                    console.error('Ошибка получения роли пользователя:', xhr.responseJSON);
                    alert('Ошибка получения роли пользователя: ' + (xhr.responseJSON?.detail || 'Неизвестная ошибка'));
                });
            },
            error: function(xhr) {
                console.error('Ошибка входа:', xhr.responseJSON);
                alert('Ошибка входа: ' + (xhr.responseJSON?.detail || 'Неизвестная ошибка'));
            }
        });
    });

    // Обработчик выхода
    $('#logout-btn').click(function() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            userRole = null;
            $('#login-form').show();
            $('#schedule-content').hide();
        }
    });
}