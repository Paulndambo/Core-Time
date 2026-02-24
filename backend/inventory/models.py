from django.db import models

from core.models import AbstractBaseModel

# Create your models here.
class Inventory(AbstractBaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    item_name = models.CharField(max_length=255)
    quantity = models.FloatField(default=1)
    category = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=255)

    def __str__(self):
        return self.item_name
