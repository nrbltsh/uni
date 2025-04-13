from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Faculty, Group, Schedule, Subject, Teacher, Classroom, User
from .serializers import FacultySerializer, GroupSerializer, ScheduleSerializer, SubjectSerializer, TeacherSerializer, ClassroomSerializer
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
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
        logger.info(f"Fetching role for user: {user.username}")
        return Response({'role': role})

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [IsManagerOrReadOnly]

    def create(self, request, *args, **kwargs):
        logger.info(f"Создание факультета: {request.data}")
        return super().create(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        logger.info("Fetching all faculties")
        return super().list(request, *args, **kwargs)

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            logger.info(f"Filtering groups by faculty_id={faculty_id}")
            if faculty_id == 'undefined' or not faculty_id.isdigit():
                logger.warning(f"Invalid faculty_id: {faculty_id}")
                raise ValidationError({'faculty_id': 'Неверный идентификатор факультета'})
            return Group.objects.filter(faculty_id=int(faculty_id))
        return Group.objects.all()

    def create(self, request, *args, **kwargs):
        logger.info(f"Создание группы: {request.data}")
        try:
            response = super().create(request, *args, **kwargs)
            logger.info(f"Group created successfully: {response.data}")
            return response
        except Exception as e:
            logger.error(f"Error creating group: {str(e)}")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        group_id = self.request.query_params.get('group_id')
        if group_id:
            logger.info(f"Filtering schedule by group_id={group_id}")
            return Schedule.objects.filter(group_id=group_id)
        return Schedule.objects.all()

    def create(self, request, *args, **kwargs):
        day = request.data.get('day_of_week')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        teacher_id = request.data.get('teacher')
        classroom_id = request.data.get('classroom')

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
        teacher_id = request.data.get('teacher', instance.teacher_id)
        classroom_id = request.data.get('classroom', instance.classroom_id)

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
            logger.info(f"Filtering subjects by faculty_id={faculty_id}")
            if faculty_id == 'undefined' or not faculty_id.isdigit():
                logger.warning(f"Invalid faculty_id: {faculty_id}")
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
            logger.info(f"Filtering teachers by faculty_id={faculty_id}")
            if faculty_id == 'undefined' or not faculty_id.isdigit():
                logger.warning(f"Invalid faculty_id: {faculty_id}")
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
            logger.info(f"Filtering classrooms by faculty_id={faculty_id}")
            if faculty_id == 'undefined' or not faculty_id.isdigit():
                logger.warning(f"Invalid faculty_id: {faculty_id}")
                raise ValidationError({'faculty_id': 'Неверный идентификатор факультета'})
            return Classroom.objects.filter(faculty_id=int(faculty_id))
        return Classroom.objects.all()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_role(request):
    logger.info(f"Fetching role for user: {request.user.username}")
    return Response({'role': request.user.role})

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        data = request.data
        username = data.get('username')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        role = data.get('role')

        logger.info(f"Registration attempt: username={username}, email={email}, role={role}")

        required_fields = ['username', 'first_name', 'last_name', 'email', 'password', 'role']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            logger.warning(f"Missing fields: {missing_fields}")
            return Response({'detail': f'Отсутствуют обязательные поля: {", ".join(missing_fields)}'}, status=400)

        if User.objects.filter(username=username).exists():
            logger.warning(f"Username {username} already exists")
            return Response({'detail': 'Пользователь с таким именем уже существует'}, status=400)
        if User.objects.filter(email=email).exists():
            logger.warning(f"Email {email} already exists")
            return Response({'detail': 'Этот email уже зарегистрирован'}, status=400)

        if role not in dict(User.ROLE_CHOICES):
            logger.warning(f"Invalid role: {role}")
            return Response({'detail': 'Недопустимая роль'}, status=400)

        import re
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, email):
            logger.warning(f"Invalid email format: {email}")
            return Response({'detail': 'Неверный формат email'}, status=400)

        logger.info("Creating user...")
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=role,
            is_active=True
        )
        logger.info(f"User created: {username}")

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        logger.info(f"Generated tokens for user {username}")

        return Response({
            'detail': 'Регистрация успешна',
            'access': access_token,
            'refresh': str(refresh)
        }, status=201)

    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response({'detail': f'Ошибка регистрации: {str(e)}'}, status=400)

def index(request):
    return render(request, 'schedule/schedule.html')

def register(request):
    return render(request, 'schedule/register.html')