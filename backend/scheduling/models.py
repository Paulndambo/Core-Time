from django.db import models
from uuid import uuid4

from core.models import AbstractBaseModel
# Create your models here.
class BookingEventType(AbstractBaseModel):
    id = models.UUIDField(default=uuid4, primary_key=True)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    event_name = models.CharField(max_length=255)
    duration = models.IntegerField(default=15)
    location = models.CharField(max_length=255)
    description = models.TextField(null=True)
    buffer_time = models.IntegerField(default=10)
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)

    def __str__(self):
        return self.event_name



class EventBooking(AbstractBaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, null=True)
    event = models.ForeignKey(BookingEventType, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=255, null=True)
    notes = models.TextField(null=True)
    booked_time = models.DateTimeField()
    status = models.CharField(max_length=255, default="Pending")

    def __str__(self):
        return self.name
    

DAYS_OF_WEEK = [
    ("Monday", "Monday"),
    ("Tuesday", "Tuesday"),
    ("Wednesday", "Wednesday"),
    ("Thursday", "Thursday"),
    ("Friday", "Friday"),
    ("Saturday", "Saturday"),
    ("Sunday", "Sunday"),
]

class AvailabilitySlot(AbstractBaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, null=True)
    day_of_week = models.CharField(max_length=20, choices=DAYS_OF_WEEK, default="Monday")
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.start_time} - {self.end_time}"