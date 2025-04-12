from rest_framework import serializers
from .models import Schedule, Group, Subject, Teacher, Classroom, Faculty, User

# Сериализатор для факультетов
class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['id', 'name']

# Сериализатор для групп
class GroupSerializer(serializers.ModelSerializer):
    faculty = serializers.StringRelatedField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'faculty']

# Сериализатор для предметов
class SubjectSerializer(serializers.ModelSerializer):
    faculty = serializers.StringRelatedField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'faculty']

# Сериализатор для преподавателей
class TeacherSerializer(serializers.ModelSerializer):
    faculty = serializers.StringRelatedField()

    class Meta:
        model = Teacher
        fields = ['id', 'last_name', 'first_name', 'middle_name', 'faculty']

# Сериализатор для аудиторий
class ClassroomSerializer(serializers.ModelSerializer):
    faculty = serializers.StringRelatedField()

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'faculty']

# Сериализатор для расписания
class ScheduleSerializer(serializers.ModelSerializer):
    # Поля для создания/обновления (используем ID связанных объектов)
    group = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all())
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    teacher = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all())
    classroom = serializers.PrimaryKeyRelatedField(queryset=Classroom.objects.all())

    # Ограничение выбора дня недели (без воскресенья)
    DAY_CHOICES = [
        ('mon', 'Понедельник'),
        ('tue', 'Вторник'),
        ('wed', 'Среда'),
        ('thu', 'Четверг'),
        ('fri', 'Пятница'),
        ('sat', 'Суббота'),
    ]

    day_of_week = serializers.ChoiceField(choices=DAY_CHOICES)

    class Meta:
        model = Schedule
        fields = ['id', 'day_of_week', 'group', 'subject', 'teacher', 'classroom', 'start_time', 'end_time']

    def to_representation(self, instance):
        # При сериализации возвращаем полные данные о связанных объектах
        representation = super().to_representation(instance)
        representation['group'] = {'id': instance.group.id, 'name': instance.group.name}
        representation['subject'] = {'id': instance.subject.id, 'name': instance.subject.name}
        representation['teacher'] = {
            'id': instance.teacher.id,
            'last_name': instance.teacher.last_name,
            'first_name': instance.teacher.first_name,
            'middle_name': instance.teacher.middle_name
        }
        representation['classroom'] = {'id': instance.classroom.id, 'name': instance.classroom.name}
        return representation

    def validate(self, data):
        # Проверка, что время окончания позже времени начала
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Время окончания должно быть позже времени начала.")
        return data