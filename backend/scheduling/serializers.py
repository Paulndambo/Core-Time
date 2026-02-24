from rest_framework import serializers
from scheduling.models import BookingEventType, EventBooking, AvailabilitySlot

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = "__all__"


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

    def get_cost(self, obj):
        return 40000


class BookingEventTypeDetailSerializer(serializers.ModelSerializer):
    event_owner = serializers.CharField(source="user.get_full_name", read_only=True)
    available_slots = serializers.SerializerMethodField()
    bookings = EventBookingSerializer(many=True, read_only=True)
    class Meta:
        model = BookingEventType
        fields = "__all__"

    def get_available_slots(self, obj):
        return obj.availability_slots.values('day_of_week', 'start_time', 'end_time')
