from django.urls import path
from finance.views import (
    TransactionAPIView, InvestmentAPIView, InvestmentDetailAPIView, TransactionUpdateAPIView, MoneyRequestAPIView, MoneyRequestDetailAPIView)

urlpatterns = [
    path("transactions/", TransactionAPIView.as_view(), name="transactions"),
    path("transactions/<int:pk>/update/", TransactionUpdateAPIView.as_view(), name="transaction-update"),
    path("investments/", InvestmentAPIView.as_view(), name="investments"),
    path("money-requests/", MoneyRequestAPIView.as_view(), name="money-requests"),
    path("money-requests/<int:pk>/details/", MoneyRequestDetailAPIView.as_view(), name="money-request-details"),
    path("investments/<int:pk>/details/", InvestmentDetailAPIView.as_view(), name="investment-details"),
    
]