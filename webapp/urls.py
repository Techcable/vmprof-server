
from django.contrib import admin
from django.conf import settings

from rest_framework import routers
from vmprofile.views import MeView, RuntimeDataViewSet, TokenViewSet
from vmlog.views import (meta, trace, stitches, upload_jit)
from vmprofile.views import runtime_new, runtime_freeze
from vmprofile.views import upload_cpu, get_cpu
from vmmemory.views import get_memory
from vmmemory import views as mem_views
from django.conf.urls import url, include
from django.contrib.staticfiles import views as static
from webapp.views import index

router = routers.DefaultRouter()
router.register(r'log', RuntimeDataViewSet)
router.register(r'profile', RuntimeDataViewSet)
router.register(r'token', TokenViewSet, basename="token")

urlpatterns = [
    url(r'^$', index),
    url(r'^admin/', admin.site.urls),
    #
    url(r'^api/', include(router.urls)),
    #
    url(r'^api/user/', MeView.as_view()),
    #
    url(r'^api/runtime/new/?$', runtime_new),
    url(r'^api/runtime/(?P<rid>[0-9a-z-]*)/freeze/?$', runtime_freeze),
    url(r'^api/runtime/upload/jit/(?P<rid>[0-9a-z-]*)/add/?$', upload_jit),
    url(r'^api/runtime/upload/cpu/(?P<rid>[0-9a-z-]*)/add/?$', upload_cpu),
    # legacy api
    url(r'^api/jitlog/(?P<rid>[0-9a-z-]*)/?$', upload_jit),
    #
    url(r'^api/jit/meta/(?P<profile>[0-9a-z-]*)/?$', meta),
    url(r'^api/jit/trace/(?P<profile>[0-9a-z-]*)/?$', trace),
    url(r'^api/jit/stitches/(?P<profile>[0-9a-z-]*)/?$', stitches),

    url(r'^api/flamegraph/(?P<rid>[0-9a-z-]*)/get/?$', get_cpu),
    url(r'^api/memorygraph/(?P<rid>[0-9a-z-]*)/get/?$', get_memory),
]

if settings.DEBUG:
    urlpatterns += [url(r'^$', static.serve, {'path': 'index.html', 'insecure': True})]
