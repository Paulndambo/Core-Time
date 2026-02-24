from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import UserScopedQuerySetMixin


from loans.models import Loan, LoanTransaction
from loans.serializers import (
    LoanSerializer, LoanDetailSerializer,
    LoanTransactionSerializer
)

# Create your views here.
class LoansAPIView(UserScopedQuerySetMixin, generics.ListCreateAPIView):
    queryset = Loan.objects.all().order_by("-created_at")
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]


    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LoanDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Loan.objects.all().order_by("-created_at")
    serializer_class = LoanDetailSerializer
    permission_classes = [IsAuthenticated]

    lookup_field = "pk"


class LoanTransactionCreateAPIView(UserScopedQuerySetMixin, generics.CreateAPIView):
    serializer_class = LoanTransactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
