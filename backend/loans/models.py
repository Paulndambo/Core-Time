from django.db import models
from core.models import AbstractBaseModel
# Create your models here.

class Loan(AbstractBaseModel):

    LOAN_DIRECTIONS = [
        ("Borrowed", "Borrowed"),
        ("Lent", "Lent")
    ]

    user = models.ForeignKey("users.User",on_delete=models.CASCADE, related_name="loans")
    counterparty_name = models.CharField(max_length=255)
    direction = models.CharField(max_length=10, choices=LOAN_DIRECTIONS)
    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Annual percentage rate")
    start_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)


    def __str__(self):
        return f"{self.counterparty_name} ({self.direction})"


class LoanTransaction(models.Model):
    class TransactionType(models.TextChoices):
        DISBURSEMENT = "DISBURSEMENT", "Loan Disbursement"
        PAYMENT = "PAYMENT", "Loan Payment (Money Out)"
        REPAYMENT = "REPAYMENT", "Loan Repayment (Money In)"
        INTEREST = "INTEREST", "Interest Charge"

    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=15, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateField()


    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"
