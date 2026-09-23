from django.contrib import admin

# Register your models here.
from .models import Device, Interface, Profile, ProfileItem, ExecutionLog


admin.site.register(Device)
admin.site.register(Interface)
admin.site.register(Profile)
admin.site.register(ProfileItem)
admin.site.register(ExecutionLog)



