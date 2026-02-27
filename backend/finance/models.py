from django.db import models
from core.models import AbstractBaseModel
# Create your models here.
class Transaction(AbstractBaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=255)
    transaction_type = models.CharField(max_length=255)
    transaction_date = models.DateField(null=True)
    payment_method = models.CharField(max_length=255, default="Mpesa")
    status = models.CharField(max_length=255, default="Pending")

    def __str__(self):
        return self.description
    

class Investment(AbstractBaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    investment_type = models.CharField(max_length=255)
    quantity = models.FloatField(default=1)
    initial_value = models.DecimalField(max_digits=10, decimal_places=2)
    current_value = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


    @property
    def change(self):
        return ((self.current_value - self.initial_value) / (self.initial_value)) * 100
    

class MoneyRequest(AbstractBaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="money_requests")
    from_whom = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=255, default="Pending")
    direction = models.CharField(max_length=255, default="Outgoing")

    def __str__(self):
        return f"{self.user.username} - {self.amount}"