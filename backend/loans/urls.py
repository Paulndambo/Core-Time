from django.urls import path
from loans.views import LoansAPIView, LoanDetailAPIView

urlpatterns = [
    path("", LoansAPIView.as_view(), name="loans"),
    path("<int:pk>/details/", LoanDetailAPIView.as_view(), name="loan-details"),
]