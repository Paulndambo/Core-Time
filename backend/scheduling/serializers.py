from rest_framework import serializers
from scheduling.models import BookingEventType, EventBooking, AvailabilitySlot


class EventBookingSerializer(serializers.ModelSerializer):
    event_owner = serializers.CharField(source="user.get_full_name", read_only=True)
    event_name = serializers.CharField(source="event.event_name", read_only=True)
    class Meta:
        model = EventBooking
        fields = "__all__"


class BookingEventTypeSerializer(serializers.ModelSerializer):
    event_owner = serializers.CharField(source="user.get_full_name", read_only=True)
    class Meta:
        model = BookingEventType
        fields = "__all__"


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    class Meta:
        model = AvailabilitySlot
        fields = "__all__"