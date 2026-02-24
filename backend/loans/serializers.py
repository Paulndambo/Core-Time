from rest_framework import serializers
from loans.models import Loan, LoanTransaction


class LoanTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanTransaction
        fields = "__all__"



class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = "__all__"


class LoanDetailSerializer(serializers.ModelSerializer):
    transactions = LoanTransactionSerializer(many=True, read_only=True)
    class Meta:
        model = Loan
        fields = "__all__"