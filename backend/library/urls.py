from django.urls import path
from library.views import (
    BookAPIView, BookDetailAPIView,
    BookReviewCreateAPIView, BookReviewDetailAPIView
)

urlpatterns = [
    path("books/", BookAPIView.as_view(), name="books"),
    path("books/<int:pk>/details/", BookDetailAPIView.as_view(), name="book-detail"),
    path("book-reviews/", BookReviewCreateAPIView.as_view(), name="create-book-review"),
    path("book-reviews/<int:pk>/details/", BookReviewDetailAPIView.as_view(), name="book-review-detail"),
]