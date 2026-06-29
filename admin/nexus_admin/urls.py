from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

admin.site.site_header = "Opportunity Nexus Admin"
admin.site.site_title = "Opportunity Nexus Admin"
admin.site.index_title = "Platform administration"


def health(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("", admin.site.urls),
    path("health/", health),
]
