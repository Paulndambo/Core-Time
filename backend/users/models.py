from django.db import models
from uuid import uuid4

from django.contrib.auth.models import AbstractUser
from core.models import AbstractBaseModel
# Create your models here.
class User(AbstractUser, AbstractBaseModel):
    id = models.UUIDField(default=uuid4, editable=False, primary_key=True)
    gender = models.CharField(max_length=255, null=True)
    phone_number = models.CharField(max_length=255, null=True)
    google_id = models.CharField(max_length=255, null=True)
    picture = models.CharField(max_length=255, null=True)
    city = models.CharField(max_length=255, null=True)
    country = models.CharField(max_length=255, null=True)


    def __str__(self):
        return self.username
    

class Event(AbstractBaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True)
    date = models.DateField()
    time = models.TimeField()
    event_link = models.URLField(null=True)

    def __str__(self):
        return self.title