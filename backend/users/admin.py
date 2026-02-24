from django.contrib import admin
from users.models import User, Event
# Register your models here.
@admin.register(User)
class UsersAdmin(admin.ModelAdmin):
    list_display = ["first_name", "last_name", "email", "username", "created_at"]


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "date", "time", "event_link"]
