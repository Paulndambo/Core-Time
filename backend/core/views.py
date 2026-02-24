from django.shortcuts import render

from django.http import HttpRequest, JsonResponse

# Create your views here.
def index(request: HttpRequest) -> JsonResponse:
    return JsonResponse({"message": "Welcome to the Personal Tracker API!"})

def health(request: HttpRequest) -> JsonResponse:
    return JsonResponse({"status": "ok"})