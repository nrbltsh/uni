import { setupSubjects } from './entities/subjects.js';
import { setupTeachers } from './entities/teachers.js';
import { setupClassrooms } from './entities/classrooms.js';
import { setupFaculties } from './entities/faculties.js';
import { setupGroups } from './entities/groups.js';
import { setupUIHandlers } from './entities/uiHandlers.js';
import { setupUtils } from './entities/utils.js';

export function setupEntities(userRole, token, utils) {
    const extendedUtils = {
        ...utils,
        ...setupUtils()
    };

    const { loadSubjectsTable } = setupSubjects(userRole, extendedUtils);
    const { loadTeachersTable } = setupTeachers(userRole, extendedUtils);
    const { loadClassroomsTable } = setupClassrooms(userRole, extendedUtils);
    const { loadFacultiesTable } = setupFaculties(userRole, extendedUtils);
    const { loadGroupsTable } = setupGroups(userRole, extendedUtils);

    setupUIHandlers(userRole, extendedUtils);

    // Инициализация таблиц
    loadSubjectsTable();
    loadTeachersTable();
    loadClassroomsTable();
    loadFacultiesTable();
    loadGroupsTable();
}