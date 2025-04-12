export function setupUtils() {
    function loadFacultiesIntoSelect(selectId) {
        $.get('/api/faculties/', function(data) {
            $(selectId).empty().append('<option value="">Выберите факультет</option>')
                .append(data.map(f => `<option value="${f.id}">${f.name}</option>`));
        }).fail(function(xhr) {
            console.error('Ошибка загрузки факультетов:', xhr.responseJSON);
        });
    }

    return { loadFacultiesIntoSelect };
}