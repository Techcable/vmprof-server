# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-09-15 15:31
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vmprofile', '0005_log_cpu_profile'),
    ]

    operations = [
        migrations.RenameModel('Log', 'CPUProfile')
    ]
