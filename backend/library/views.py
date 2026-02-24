from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated

from core.permissions import UserScopedQuerySetMixin

from library.models import Book, BookReview
from library.serializers import BookSerializer, BookReviewSerializer, BookDetailSerializer
# Create your views here.
class BookAPIView(generics.ListCreateAPIView, UserScopedQuerySetMixin):
    queryset = Book.objects.all().order_by("-created_at")
    serializer_class = BookSerializer

    permission_classes = [IsAuthenticated]


class BookDetailAPIView(generics.RetrieveUpdateDestroyAPIView, UserScopedQuerySetMixin):
    queryset = Book.objects.all().order_by("-created_at")
    serializer_class = BookDetailSerializer

    permission_classes = [IsAuthenticated]
    lookup_field = "pk"


class BookReviewCreateAPIView(generics.CreateAPIView, UserScopedQuerySetMixin):
    queryset = BookReview.objects.all()
    serializer_class = BookReviewSerializer
    permission_classes = [IsAuthenticated]


class BookReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView, UserScopedQuerySetMixin):
    queryset = BookReview.objects.all()
    serializer_class = BookReviewSerializer
    permission_classes = [IsAuthenticated]

    lookup_field = "pk"