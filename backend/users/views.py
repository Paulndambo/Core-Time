import os
from django.conf import settings
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests
from google.oauth2 import id_token
from users.models import User, Event
from users.serializers import UserSerializer, EventSerializer

from core.permissions import UserScopedQuerySetMixin

def verify_google_token(credential):
    """
    Verify Google OAuth token and return user info
    """
    try:
        # Get Google Client ID from settings or environment
        client_id = os.environ.get('GOOGLE_CLIENT_ID') or getattr(settings, 'GOOGLE_CLIENT_ID', None)
        
        if not client_id:
            raise ValueError("GOOGLE_CLIENT_ID not configured")
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            client_id
        )
        
        # Verify the token is from Google
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        return idinfo
    except ValueError as e:
        raise ValueError(f'Invalid token: {str(e)}')


def get_or_create_user(google_user_info):
    """
    Get or create a Django user from Google user info
    """
    email = google_user_info.get('email')
    google_id = google_user_info.get('sub')
    first_name = google_user_info.get('given_name', '')
    last_name = google_user_info.get('family_name', '')
    picture = google_user_info.get('picture', '')
    
    if not email:
        raise ValueError('Email is required')
    
    # Try to get user by email or google_id first
    user = None
    if google_id:
        try:
            user = User.objects.get(google_id=google_id)
        except User.DoesNotExist:
            pass
    
    if not user:
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            pass
    
    if user:
        # Update user info if needed
        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name
        if google_id and not user.google_id:
            user.google_id = google_id
        if picture and not user.picture:
            user.picture = picture
        user.save()
    else:
        # Create new user
        # Use email as username, or generate unique username if email already taken
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            google_id=google_id,
            picture=picture,
        )
    
    return user


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Authenticate user with Google OAuth token
    POST /api/auth/google/
    Body: { "credential": "google_jwt_token" }
    """
    try:
        credential = request.data.get('credential')
        
        if not credential:
            return Response(
                {'error': 'Credential is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify Google token
        google_user_info = verify_google_token(credential)
        
        # Get or create user
        user = get_or_create_user(google_user_info)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Serialize user data
        user_serializer = UserSerializer(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Authentication failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current authenticated user
    GET /api/auth/user/
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


class EventAPIView(UserScopedQuerySetMixin, generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by("-created_at")
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]