from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    path('auth/google/', views.google_auth, name='google-auth'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/user/', views.get_current_user, name='current-user'),
    path("events/", views.EventAPIView.as_view(), name="events"),
]
