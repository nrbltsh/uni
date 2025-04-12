export function setupFaculties(userRole, utils) {
    const { loadFaculties, loadGroups } = utils;

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

    $('#add-faculty-form').submit(function(event) {
        event.preventDefault();
        const name = $('#faculty-name').val();
        if (!name) {
            alert('Пожалуйста, введите название факультета.');
            return;
        }
        const data = { name: name };
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
                    }, 500);
                },
                error: function(xhr) {
                    alert('Ошибка удаления: ' + JSON.stringify(xhr.responseJSON));
                }
            });
        }
    });

    return { loadFacultiesTable };
}