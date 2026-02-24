from django.db import models

from core.models import AbstractBaseModel

# Create your models here.
class Integration(AbstractBaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    service_name = models.CharField(max_length=255)
    refresh_token = models.CharField(max_length=255)

    def __str__(self):
        return self.service_name
