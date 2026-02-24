from rest_framework import serializers
from finance.models import Transaction, Investment

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"


class InvestmentSerializer(serializers.ModelSerializer):
    change=serializers.FloatField(read_only=True)
    class Meta:
        model = Investment
        fields = "__all__"