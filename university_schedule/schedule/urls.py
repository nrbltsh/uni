from django.urls import path, include
from rest_framework import routers
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

app_name = 'schedule'  # Namespace для маршрутов

router = routers.DefaultRouter()
router.register(r'faculties', views.FacultyViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'schedule', views.ScheduleViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'teachers', views.TeacherViewSet)
router.register(r'classrooms', views.ClassroomViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register, name='register'),  # Новый маршрут для страницы регистрации
    path('api/', include(router.urls)),
    path('api/register/', views.register_user, name='register_user'),
    path('api/user-role/', views.get_user_role, name='get_user_role'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]