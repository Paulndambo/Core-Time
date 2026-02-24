from rest_framework import serializers
from library.models import Book, BookReview

class BookReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookReview
        fields = "__all__"


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"


class BookDetailSerializer(serializers.ModelSerializer):
    book_reviews = BookReviewSerializer(many=True)
    class Meta:
        model = Book
        fields = "__all__"