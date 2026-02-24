from django.contrib import admin
from scheduling.models import BookingEventType, EventBooking, AvailabilitySlot
# Register your models here.
@admin.register(BookingEventType)
class BookingEventTypeAdmin(admin.ModelAdmin):
    list_display = ("event_name", "user", "duration", "location", "created_at")
    search_fields = ("event_name", "user__username", "location")
    list_filter = ("created_at",)

@admin.register(EventBooking)
class EventBookingAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "booked_time", "status", "created_at")
    search_fields = ("name", "email", "user__username")
    list_filter = ("created_at", "status")

@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ("user", "day_of_week", "start_time", "end_time")
    list_filter = ("day_of_week",)