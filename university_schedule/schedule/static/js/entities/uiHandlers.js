export function setupUIHandlers(userRole, utils) {
    const { loadFacultiesIntoSelect } = utils;

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

    if (userRole !== 'manager') {
        $('#show-subjects').hide();
        $('#show-faculties').hide();
        $('#show-teachers').hide();
        $('#show-classrooms').hide();
        $('#show-groups').hide();
    }
}