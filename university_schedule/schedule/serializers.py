from rest_framework import serializers
from .models import Faculty, Group, Subject, Teacher, Classroom, Schedule, User

class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['id', 'name']

class GroupSerializer(serializers.ModelSerializer):
    faculty = serializers.PrimaryKeyRelatedField(queryset=Faculty.objects.all(), allow_null=False)
    class Meta:
        model = Group
        fields = ['id', 'name', 'faculty']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['faculty'] = {'id': instance.faculty.id, 'name': instance.faculty.name} if instance.faculty else None
        return representation

class SubjectSerializer(serializers.ModelSerializer):
    faculty = serializers.PrimaryKeyRelatedField(queryset=Faculty.objects.all(), allow_null=False)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'faculty']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['faculty'] = {'id': instance.faculty.id,
                                     'name': instance.faculty.name} if instance.faculty else None
        return representation

class TeacherSerializer(serializers.ModelSerializer):
    faculty = serializers.PrimaryKeyRelatedField(queryset=Faculty.objects.all(), allow_null=False)

    class Meta:
        model = Teacher
        fields = ['id', 'last_name', 'first_name', 'middle_name', 'faculty']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['faculty'] = {'id': instance.faculty.id,
                                     'name': instance.faculty.name} if instance.faculty else None
        return representation


class ClassroomSerializer(serializers.ModelSerializer):
    faculty = serializers.PrimaryKeyRelatedField(queryset=Faculty.objects.all(), allow_null=False)

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'faculty']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['faculty'] = {'id': instance.faculty.id,
                                     'name': instance.faculty.name} if instance.faculty else None
        return representation

class ScheduleSerializer(serializers.ModelSerializer):
    group = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all())
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    teacher = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all())
    classroom = serializers.PrimaryKeyRelatedField(queryset=Classroom.objects.all())
    day_of_week = serializers.ChoiceField(choices=[
        ('mon', 'Понедельник'),
        ('tue', 'Вторник'),
        ('wed', 'Среда'),
        ('thu', 'Четверг'),
        ('fri', 'Пятница'),
        ('sat', 'Суббота'),
    ])

    class Meta:
        model = Schedule
        fields = ['id', 'day_of_week', 'group', 'subject', 'teacher', 'classroom', 'start_time', 'end_time']

    def to_representation(self, instance):
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

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'phone', 'role']