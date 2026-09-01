from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import Group, User
from apps.orders.models import Order
from apps.products.models import Product, Category
from apps.accounts.models import User as CustomUser
from apps.payments.models import Payment
from django.db.models import Count, Sum, Q
from datetime import datetime, timedelta

class CustomAdminSite(AdminSite):
    site_header = '☕ Coffee Shop Admin'
    site_title = 'Coffee Shop Admin'
    index_title = 'Dashboard'

    def get_app_list(self, request):
        app_list = super().get_app_list(request)
        
        # Add custom dashboard stats
        stats = self.get_dashboard_stats()
        app_list.insert(0, {
            'name': 'Dashboard',
            'app_label': 'dashboard',
            'models': [{
                'name': 'Statistics',
                'object_name': 'Stats',
                'admin_url': '#',
                'view_only': True,
                'stats': stats
            }]
        })
        return app_list

    def get_dashboard_stats(self):
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        today_orders = Order.objects.filter(created_at__date=today).count()
        total_revenue = Order.objects.filter(status='completed').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        # Weekly stats
        weekly_orders = Order.objects.filter(created_at__date__gte=week_ago).count()
        weekly_revenue = Order.objects.filter(
            status='completed', 
            created_at__date__gte=week_ago
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        return {
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'today_orders': today_orders,
            'total_revenue': total_revenue,
            'weekly_orders': weekly_orders,
            'weekly_revenue': weekly_revenue,
        }

# Replace default admin site
admin.site = CustomAdminSite()