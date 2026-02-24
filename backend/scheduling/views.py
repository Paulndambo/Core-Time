from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from core.permissions import UserScopedQuerySetMixin


from scheduling.models import EventBooking, BookingEventType, AvailabilitySlot
from scheduling.serializers import BookingEventTypeSerializer, EventBookingSerializer, AvailabilitySlotSerializer
# Create your views here.
class AvailabilitySlotAPIView(UserScopedQuerySetMixin, generics.ListCreateAPIView):
    queryset = AvailabilitySlot.objects.all().order_by("-created_at")
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [IsAuthenticated]


class BookingEventTypeAPIView(UserScopedQuerySetMixin, generics.ListCreateAPIView):
    queryset = BookingEventType.objects.all().order_by("-created_at")
    serializer_class = BookingEventTypeSerializer
    permission_classes = [IsAuthenticated]


class BookingEventTypeDetailAPIView(generics.RetrieveAPIView):
    queryset = BookingEventType.objects.all().order_by("-created_at")
    serializer_class = BookingEventTypeSerializer
    permission_classes = [AllowAny]

    lookup_field = "pk"


class EventBookingsAPIView(UserScopedQuerySetMixin, generics.ListAPIView):
    queryset = EventBooking.objects.all().order_by("-created_at")
    serializer_class = EventBookingSerializer
    permission_classes = [IsAuthenticated]


class EventBookingsDetailsAPIView(UserScopedQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = EventBooking.objects.all().order_by("-created_at")
    serializer_class = EventBookingSerializer
    permission_classes = [IsAuthenticated]

    lookup_field = "pk"



class EventBookingsCreateAPIView(generics.CreateAPIView):
    serializer_class = EventBookingSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid(raise_exception=True):
            booking = serializer.save()
            booking.user = booking.event.user
            booking.save()
            return Response({"success": "Event Booking Recorded successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

