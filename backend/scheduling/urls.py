from django.urls import path
from scheduling.views import (
    BookingEventTypeAPIView, BookingEventTypeDetailAPIView,
    EventBookingsAPIView, EventBookingsCreateAPIView, EventBookingsDetailsAPIView,
    AvailabilitySlotAPIView
)

urlpatterns = [
    path("event-types/", BookingEventTypeAPIView.as_view(), name="event-types"),
    path("event-types/<uuid:pk>/details/", BookingEventTypeDetailAPIView.as_view(), name="event-type-details"),
    path("event-bookings/", EventBookingsAPIView.as_view(), name="event-bookings"),
    path("event-bookings/<int:pk>/details/", EventBookingsDetailsAPIView.as_view(), name="event-booking-details"),
    path("create-event-booking/", EventBookingsCreateAPIView.as_view(), name="create-event-booking"),
    path("availability-slots/", AvailabilitySlotAPIView.as_view(), name="availability-slots"),
]