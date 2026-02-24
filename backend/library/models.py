from django.db import models

from core.models import AbstractBaseModel
# Create your models here.
class Book(AbstractBaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    pages = models.IntegerField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=255, choices=[("Reading", "Reading"), ("Want to Read", "Want to Read"), ("Completed", "Completed")], default="Want to Read")

    def __str__(self):
        return self.title
    

class BookReview(AbstractBaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="book_reviews")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="book_reviews")
    review_text = models.TextField()
    rating = models.IntegerField(default=1)

