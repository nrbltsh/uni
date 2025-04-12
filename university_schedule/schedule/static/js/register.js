import { refreshToken } from './utils.js';

$(document).ready(function() {
    // Обработчик формы регистрации
    $('#register-form form').submit(function(event) {
        event.preventDefault();
        const username = $('#reg-username').val();
        const first_name = $('#reg-first-name').val();
        const last_name = $('#reg-last-name').val();
        const email = $('#reg-email').val();
        const phone = $('#reg-phone').val();
        const password = $('#reg-password').val();
        const role = $('#role').val();

        if (!username || !first_name || !last_name || !email || !password || !role) {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        $.ajax({
            url: '/api/register/',
            method: 'POST',
            data: JSON.stringify({
                username: username,
                first_name: first_name,
                last_name: last_name,
                email: email,
                phone: phone,
                password: password,
                role: role
            }),
            contentType: 'application/json',
            headers: {},
            success: function(data) {
                console.log('Регистрация успешна:', data);
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                $.ajaxSetup({ headers: { 'Authorization': 'Bearer ' + data.access } });
                alert('Регистрация успешна! Вы будете перенаправлены на страницу входа.');
                window.location.href = '/'; // Перенаправляем на главную страницу (вход)
            },
            error: function(xhr) {
                console.error('Ошибка регистрации:', xhr.responseJSON);
                alert('Ошибка регистрации: ' + (xhr.responseJSON?.detail || 'Неизвестная ошибка'));
            }
        });
    });
});