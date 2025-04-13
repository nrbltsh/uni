export function loadFaculties() {
    $.get('/api/faculties/', function(data) {
        console.log('Факультеты загружены:', data);
        const $selects = $('#filter-faculty, #group-faculty, #edit-group-faculty, #teacher-faculty, #classroom-faculty, #subject-faculty, #edit-subject-faculty');
        $selects.empty().append('<option value="">Выберите факультет</option>');
        if (data && data.length > 0) {
            $selects.append(data.map(f => `<option value="${f.id}">${f.name}</option>`));
        } else {
            console.warn('Факультеты не найдены');
            $selects.append('<option value="">Факультеты отсутствуют</option>');
        }
    }).fail(function(xhr) {
        console.error('Ошибка загрузки факультетов:', xhr.responseJSON);
        alert('Ошибка загрузки факультетов: ' + (xhr.responseJSON?.detail || 'Неизвестная ошибка'));
    });
}

export function loadGroups() {
    $.get('/api/groups/', function(data) {
        console.log('Группы загружены:', data);
        $('#group, #edit-group').empty().append('<option value="">Выберите группу</option>')
            .append(data.map(g => `<option value="${g.id}" data-faculty-id="${g.faculty ? g.faculty.id : ''}">${g.name}</option>`));
        $('#filter-group').empty().append('<option value="">Выберите группу</option>')
            .append(data.map(g => `<option value="${g.id}">${g.name}</option>`));
    }).fail(function(xhr) {
        console.error('Ошибка загрузки групп:', xhr.responseJSON);
        alert('Ошибка загрузки групп: ' + (xhr.responseJSON?.detail || 'Неизвестная ошибка'));
    });
}

export function loadSubjects(facultyId = null) {
    let url = '/api/subjects/';
    if (facultyId && facultyId !== 'undefined') {
        url += `?faculty_id=${facultyId}`;
    }
    $.get(url, function(data) {
        console.log('Предметы загружены:', data);
        $('#subject, #edit-subject').empty().append('<option value="">Выберите предмет</option>')
            .append(data.map(s => `<option value="${s.id}">${s.name}</option>`));
    }).fail(function(xhr) {
        console.error('Ошибка загрузки предметов:', xhr.responseJSON);
        alert('Ошибка загрузки предметов: ' + (xhr.responseJSON?.detail || 'Неизвестная ошибка'));
    });
}

export function loadTeachers(facultyId = null) {
    let url = '/api/teachers/';
    if (facultyId && facultyId !== 'undefined') {
        url += `?faculty_id=${facultyId}`;
    }
    $.get(url, function(data) {
        console.log('Преподаватели загружены:', data);
        $('#teacher, #edit-teacher').empty().append('<option value="">Выберите преподавателя</option>')
            .append(data.map(t => `<option value="${t.id}">${t.last_name} ${t.first_name} ${t.middle_name}</option>`));
    }).fail(function(xhr) {
        console.error('Ошибка загрузки преподавателей:', xhr.responseJSON);
        alert('Ошибка загрузки преподавателей: ' + (xhr.responseJSON?.detail || 'Неизвестная ошибка'));
    });
}

export function loadClassrooms(facultyId = null) {
    let url = '/api/classrooms/';
    if (facultyId && facultyId !== 'undefined') {
        url += `?faculty_id=${facultyId}`;
    }
    $.get(url, function(data) {
        console.log('Аудитории загружены:', data);
        $('#classroom, #edit-classroom').empty().append('<option value="">Выберите аудиторию</option>')
            .append(data.map(c => `<option value="${c.id}">${c.name}</option>`));
    }).fail(function(xhr) {
        console.error('Ошибка загрузки аудиторий:', xhr.responseJSON);
        alert('Ошибка загрузки аудиторий: ' + (xhr.responseJSON?.detail || 'Неизвестная ошибка'));
    });
}

// Переменная для предотвращения одновременных обновлений токена
let isRefreshing = false;

export function refreshToken() {
    if (isRefreshing) {
        // Если обновление уже идёт, ждём его завершения
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (!isRefreshing) {
                    clearInterval(interval);
                    resolve(localStorage.getItem('access_token'));
                }
            }, 100);
        });
    }

    isRefreshing = true;
    return new Promise((resolve, reject) => {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (!refreshTokenValue) {
            console.error('Refresh-токен отсутствует');
            alert('Сессия истекла. Пожалуйста, войдите снова.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            $('#login-form').show();
            $('#register-form').show();
            $('#schedule-content').hide();
            isRefreshing = false;
            reject(new Error('No refresh token'));
            return;
        }

        $.ajax({
            url: '/api/token/refresh/',
            method: 'POST',
            data: { refresh: refreshTokenValue },
            success: function(data) {
                const token = data.access;
                localStorage.setItem('access_token', token);
                $.ajaxSetup({ headers: { 'Authorization': 'Bearer ' + token } });
                console.log('Токен успешно обновлён:', token);
                isRefreshing = false;
                resolve(token);
            },
            error: function(xhr) {
                console.error('Ошибка обновления токена:', xhr.responseJSON);
                alert('Ошибка обновления токена: ' + (xhr.responseJSON?.detail || 'Неизвестная ошибка'));
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                $('#login-form').show();
                $('#register-form').show();
                $('#schedule-content').hide();
                isRefreshing = false;
                reject(xhr);
            }
        });
    });
}