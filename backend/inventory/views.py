from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import UserScopedQuerySetMixin

from inventory.models import Inventory
from inventory.serializers import InventorySerializer
# Create your views here.
class InventoryAPIView(UserScopedQuerySetMixin, generics.ListCreateAPIView):
    queryset = Inventory.objects.all().order_by("-created_at")
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]


class InventoryDetailAPIView(UserScopedQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.all().order_by("-created_at")
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

    lookup_field = "pk"

