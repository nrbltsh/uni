import { refreshToken } from './utils.js';

$(document).ready(function() {
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

        const data = {
            username: username,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone,
            password: password,
            role: role
        };
        console.log('Отправка данных регистрации:', data);

        $.ajax({
            url: '/api/register/',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                console.log('Регистрация успешна:', response);
                localStorage.setItem('access_token', response.access);
                localStorage.setItem('refresh_token', response.refresh);
                $.ajaxSetup({ headers: { 'Authorization': 'Bearer ' + response.access } });
                alert('Регистрация успешна! Вы будете перенаправлены.');
                window.location.href = '/';
            },
            error: function(xhr) {
                console.error('Ошибка регистрации:', xhr.responseJSON);
                const errorMessage = xhr.responseJSON?.detail || JSON.stringify(xhr.responseJSON) || 'Неизвестная ошибка';
                alert(`Ошибка регистрации: ${errorMessage}`);
            }
        });
    });
});