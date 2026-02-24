from django.contrib import admin
from loans.models import Loan, LoanTransaction
# Register your models here.
@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ["id", "counterparty_name", "principal_amount", "outstanding_balance"]


@admin.register(LoanTransaction)
class LoanTransactionAdmin(admin.ModelAdmin):
    list_display = ["id", "loan", "transaction_type", "transaction_date"]