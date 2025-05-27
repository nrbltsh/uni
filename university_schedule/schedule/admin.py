from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Faculty, Group, Teacher, Subject, Classroom, Schedule, User


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('day_of_week', 'group', 'subject', 'teacher', 'classroom', 'start_time', 'end_time')
    list_filter = ('day_of_week', 'group__faculty', 'group')
    search_fields = ('subject__name', 'teacher__last_name', 'classroom__name')
    ordering = ('day_of_week', 'start_time')

    def has_module_permission(self, request):
        return request.user.is_authenticated and request.user.role == 'manager'

    def has_view_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_add_permission(self, request):
        return self.has_module_permission(request)

    def has_change_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_delete_permission(self, request, obj=None):
        return self.has_module_permission(request)


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('name',)

    def has_module_permission(self, request):
        return request.user.is_authenticated and request.user.role == 'manager'


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'faculty')
    list_filter = ('faculty',)

    def has_module_permission(self, request):
        return request.user.is_authenticated and request.user.role == 'manager'


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name')

    def has_module_permission(self, request):
        return request.user.is_authenticated and request.user.role == 'manager'


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name',)

    def has_module_permission(self, request):
        return request.user.is_authenticated and request.user.role == 'manager'


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('name',)

    def has_module_permission(self, request):
        return request.user.is_authenticated and request.user.role == 'manager'


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ('username', 'role', 'is_staff', 'is_active', 'is_superuser')
    list_filter = ('role', 'is_staff', 'is_active', 'is_superuser')

    fieldsets = (
        (None, {'fields': ('username', 'password', 'role', 'phone')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'role', 'phone', 'password1', 'password2', 'is_staff', 'is_active', 'is_superuser'),
        }),
    )

    search_fields = ('username',)
    ordering = ('username',)
