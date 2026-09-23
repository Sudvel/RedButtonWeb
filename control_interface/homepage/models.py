from django.db import models
from django.contrib.auth.models import User

class Device(models.Model):
    PLATFORM_CHOICES = [
        ('cisco_iosxe', 'Cisco IOS-XE'),
        ('cisco_nxos', 'Cisco NX-OS'),
        ('arista_eos', 'Arista EOS'),
        ('juniper_junos', 'Juniper JunOS'),
        ('huawei_vrp', 'Huawei VRP'),
    ]

    hostname = models.CharField(max_length=100, unique=True, verbose_name="Имя хоста")
    ip_address = models.GenericIPAddressField(unique=True, verbose_name="IP адрес управления")
    platform = models.CharField(max_length=30, choices=PLATFORM_CHOICES, default='cisco_iosxe')
    login = models.CharField(max_length=50, verbose_name="Имя пользоавтеля")

    def __str__(self):
        return f"{self.hostname} ({self.ip_address})"


class Interface(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='interfaces')
    name = models.CharField(max_length=64, verbose_name="Имя интерфейса (e.g. TenGigE0/0/1)")
    description = models.CharField(max_length=255, blank=True, verbose_name="Описание интерфейса")

    class Meta:
        # На одном устройстве не может быть двух одинаковых интерфейсов
        unique_together = ('device', 'name')

    def __str__(self):
        return f"{self.device.hostname} - {self.name}"


class Profile(models.Model):
    name = models.CharField(max_length=128, unique=True, verbose_name="Название профиля")
    description = models.TextField(blank=True, verbose_name="Описание сценария")
    # Связь многие-ко-многим через явную промежуточную модель ProfileItem
    interfaces = models.ManyToManyField(
        Interface, 
        through='ProfileItem', 
        related_name='profiles'
    )

    def __str__(self):
        return self.name


class ProfileItem(models.Model):
    ACTION_CHOICES = [
        ('shutdown', 'Отключить (Shutdown)'),
        ('no_shutdown', 'Включить (No Shutdown)'),
        ('apply_acl', 'Применить защитный ACL'),
    ]

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='items')
    interface = models.ForeignKey(Interface, on_delete=models.CASCADE)
    action = models.CharField(max_length=32, choices=ACTION_CHOICES, default='shutdown')

    class Meta:
        # Один и тот же интерфейс не должен дублироваться внутри одного профиля
        unique_together = ('profile', 'interface')

    def __str__(self):
        return f"[{self.profile.name}] {self.interface} -> {self.action}"


class ExecutionLog(models.Model):
    STATUS_CHOICES = [
        ('pending', 'В очереди'),
        ('running', 'Выполняется'),
        ('success', 'Успешно завершено'),
        ('failed', 'Завершено с ошибками'),
    ]

    profile = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True)
    initiated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    log_output = models.JSONField(default=dict, blank=True, verbose_name="Лог Nornir по хостам")