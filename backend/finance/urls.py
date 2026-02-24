from django.urls import path
from finance.views import TransactionAPIView, InvestmentAPIView, InvestmentDetailAPIView

urlpatterns = [
    path("transactions/", TransactionAPIView.as_view(), name="transactions"),
    path("investments/", InvestmentAPIView.as_view(), name="investments"),
    path("investments/<int:pk>/details/", InvestmentDetailAPIView.as_view(), name="investment-details"),
    
]