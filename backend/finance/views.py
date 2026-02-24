from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import UserScopedQuerySetMixin


from finance.models import Transaction, Investment
from finance.serializers import TransactionSerializer, InvestmentSerializer
# Create your views here.
class TransactionAPIView(UserScopedQuerySetMixin, generics.ListCreateAPIView):
    queryset = Transaction.objects.all().order_by("-created_at")
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]


class InvestmentAPIView(UserScopedQuerySetMixin, generics.ListCreateAPIView):
    queryset = Investment.objects.all().order_by("-created_at")
    serializer_class = InvestmentSerializer
    permission_classes = [IsAuthenticated]

    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class InvestmentDetailAPIView(UserScopedQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Investment.objects.all().order_by("-created_at")
    serializer_class = InvestmentSerializer
    permission_classes = [IsAuthenticated]

    lookup_field = "pk"