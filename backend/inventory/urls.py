from django.urls import path
from inventory.views import InventoryAPIView, InventoryDetailAPIView

urlpatterns = [
    path("", InventoryAPIView.as_view(), name="inventory"),
    path("<int:pk>/details/", InventoryDetailAPIView.as_view(), name="inventory-details"),
]