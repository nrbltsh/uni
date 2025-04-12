from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from .models import Faculty, Group, Schedule, Subject, Teacher, Classroom, User
from .serializers import FacultySerializer, GroupSerializer, ScheduleSerializer, SubjectSerializer, TeacherSerializer, ClassroomSerializer
import logging
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

class IsManagerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'manager'

class UserRoleView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role
        return Response({'role': role})

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [IsManagerOrReadOnly]

    def create(self, request, *args, **kwargs):
        logger.info(f"Создание факультета: {request.data}")
        return super().create(request, *args, **kwargs)

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            return Group.objects.filter(faculty_id=faculty_id)
        return Group.objects.all()

    def create(self, request, *args, **kwargs):
        logger.info(f"Создание группы: {request.data}")
        return super().create(request, *args, **kwargs)

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        group_id = self.request.query_params.get('group_id')
        if group_id:
            return Schedule.objects.filter(group_id=group_id)
        return Schedule.objects.all()

    def create(self, request, *args, **kwargs):
        day = request.data.get('day_of_week')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        teacher_id = request.data.get('teacher_id')
        classroom_id = request.data.get('classroom_id')

        teacher_conflicts = Schedule.objects.filter(
            day_of_week=day,
            teacher_id=teacher_id,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        if teacher_conflicts.exists():
            logger.warning(f"Конфликт преподавателя: {teacher_id} в {day} с {start_time} до {end_time}")
            return Response(
                {'error': 'Конфликт: преподаватель уже занят в это время.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        classroom_conflicts = Schedule.objects.filter(
            day_of_week=day,
            classroom_id=classroom_id,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        if classroom_conflicts.exists():
            logger.warning(f"Конфликт аудитории: {classroom_id} в {day} с {start_time} до {end_time}")
            return Response(
                {'error': 'Конфликт: аудитория уже занята в это время.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info(f"Создание занятия: {request.data}")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        day = request.data.get('day_of_week', instance.day_of_week)
        start_time = request.data.get('start_time', instance.start_time)
        end_time = request.data.get('end_time', instance.end_time)
        teacher_id = request.data.get('teacher_id', instance.teacher_id)
        classroom_id = request.data.get('classroom_id', instance.classroom_id)

        teacher_conflicts = Schedule.objects.filter(
            day_of_week=day,
            teacher_id=teacher_id,
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exclude(id=instance.id)

        if teacher_conflicts.exists():
            logger.warning(f"Конфликт преподавателя при обновлении: {teacher_id} в {day} с {start_time} до {end_time}")
            return Response(
                {'error': 'Конфликт: преподаватель уже занят в это время.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        classroom_conflicts = Schedule.objects.filter(
            day_of_week=day,
            classroom_id=classroom_id,
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exclude(id=instance.id)

        if classroom_conflicts.exists():
            logger.warning(f"Конфликт аудитории при обновлении: {classroom_id} в {day} с {start_time} до {end_time}")
            return Response(
                {'error': 'Конфликт: аудитория уже занята в это время.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info(f"Обновление занятия: {request.data}")
        return super().update(request, *args, **kwargs)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            if faculty_id == 'undefined' or not faculty_id.isdigit():
                raise ValidationError({'faculty_id': 'Неверный идентификатор факультета'})
            return Subject.objects.filter(faculty_id=int(faculty_id))
        return Subject.objects.all()

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            if faculty_id == 'undefined' or not faculty_id.isdigit():
                raise ValidationError({'faculty_id': 'Неверный идентификатор факультета'})
            return Teacher.objects.filter(faculty_id=int(faculty_id))
        return Teacher.objects.all()

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            if faculty_id == 'undefined' or not faculty_id.isdigit():
                raise ValidationError({'faculty_id': 'Неверный идентификатор факультета'})
            return Classroom.objects.filter(faculty_id=int(faculty_id))
        return Classroom.objects.all()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_role(request):
    return Response({'role': request.user.role})

@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def register_user(request):
    try:
        username = request.data.get('username')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        password = request.data.get('password')
        role = request.data.get('role')

        logger.info(f"Registration attempt: username={username}, email={email}, role={role}")

        if not all([username, first_name, last_name, email, password, role]):
            logger.warning("Missing required fields")
            return Response({'detail': 'Все поля обязательны'}, status=400)

        if User.objects.filter(username=username).exists():
            logger.warning(f"Username {username} already exists")
            return Response({'detail': 'Пользователь с таким именем уже существует'}, status=400)
        if User.objects.filter(email=email).exists():
            logger.warning(f"Email {email} already exists")
            return Response({'detail': 'Этот email уже зарегистрирован'}, status=400)

        if role not in dict(User.ROLE_CHOICES):
            logger.warning(f"Invalid role: {role}")
            return Response({'detail': 'Недопустимая роль'}, status=400)

        logger.info("Creating user...")
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=role
        )
        logger.info(f"User created: {username}")

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        logger.info(f"Generated tokens for user {username}: access={access_token}, refresh={str(refresh)}")

        return Response({
            'detail': 'Регистрация успешна',
            'access': access_token,
            'refresh': str(refresh)
        }, status=201)

    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        return Response({'detail': f'Ошибка на сервере: {str(e)}'}, status=500)

def index(request):
    return render(request, 'schedule/schedule.html')

def register(request):
    return render(request, 'schedule/register.html')