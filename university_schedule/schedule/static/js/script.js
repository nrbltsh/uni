import { handleAuth } from './auth.js';
import { setupSchedule } from './schedule.js';
import { setupEntities } from './entities.js';
import { loadFaculties, loadGroups, loadSubjects, loadTeachers, loadClassrooms, refreshToken } from './utils.js';

// Глобальные переменные
let token = localStorage.getItem('access_token');
let userRole = null;

// Инициализация приложения
$(document).ready(function() {
    // Настройка AJAX-запросов с токеном
    if (token) {
        $.ajaxSetup({ headers: { 'Authorization': 'Bearer ' + token } });
    }

    // Глобальный перехватчик ошибок для обработки истёкших токенов
    $.ajaxSetup({
        beforeSend: function(xhr) {
            console.log('Отправка запроса:', this.url); // Логируем запросы для отладки
        },
        error: async function(xhr, status, error) {
            if (xhr.status === 401 && xhr.responseJSON?.code === 'token_not_valid') {
                console.log('Токен истёк, пытаемся обновить...');
                try {
                    await refreshToken();
                    // Обновляем заголовок с новым токеном
                    const newToken = localStorage.getItem('access_token');
                    $.ajaxSetup({ headers: { 'Authorization': 'Bearer ' + newToken } });
                    console.log('Повторяем запрос с новым токеном:', xhr.url);
                    // Повторяем исходный запрос
                    $.ajax(xhr);
                } catch (err) {
                    console.error('Не удалось обновить токен:', err);
                    // Если обновление не удалось, пользователь уже перенаправлен на форму входа в refreshToken
                }
            } else {
                console.error('Ошибка AJAX:', xhr.responseJSON || error);
            }
        }
    });

    // Инициализация модулей
    handleAuth(token, userRole, setupSchedule, setupEntities, { loadFaculties, loadGroups, loadSubjects, loadTeachers, loadClassrooms, refreshToken });
});