from django.db import models


class NetworkDevices(models.Model):
    host_name = models.CharField(max_length=128, null=True, blank=True)
    ip_address = models.GenericIPAddressField(protocol='both')
    device_type = models.CharField(max_length=128)
    profile_name = models.CharField(max_length=128, null=True, blank=True)
    user_login = models.CharField(max_length=128)
    


class Ports(models.Model):
    port_name = models.CharField(max_length=128)
    device_ip = models.ForeignKey(
        NetworkDevices, 
        on_delete=models.CASCADE
    )

