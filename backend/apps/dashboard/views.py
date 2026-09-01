from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order
from apps.products.models import Product, Category
from django.contrib.auth import get_user_model
from apps.payments.models import Payment

User = get_user_model()

class DashboardStatsView(APIView):
    """
    API endpoint for dashboard statistics.
    Returns: total orders, revenue, users, recent orders, etc.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if user is staff/admin
        if not request.user.is_staff:
            return Response({'error': 'Staff access required'}, status=403)

        # Get date ranges
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Basic statistics
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        completed_orders = Order.objects.filter(status='completed').count()
        
        # Revenue statistics
        total_revenue = Order.objects.filter(
            status='completed'
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        today_revenue = Order.objects.filter(
            status='completed',
            created_at__date=today
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        week_revenue = Order.objects.filter(
            status='completed',
            created_at__date__gte=week_ago
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        # User statistics
        total_users = User.objects.count()
        new_users_today = User.objects.filter(date_joined__date=today).count()
        new_users_week = User.objects.filter(date_joined__date__gte=week_ago).count()

        # Product statistics
        total_products = Product.objects.count()
        out_of_stock = Product.objects.filter(stock_quantity=0).count()
        low_stock = Product.objects.filter(stock_quantity__lt=10, stock_quantity__gt=0).count()
        total_categories = Category.objects.count()

        # Recent orders (last 10)
        recent_orders = Order.objects.order_by('-created_at')[:10].values(
            'id', 'order_number', 'user__username', 'status', 'total_amount', 'created_at'
        )
        
        # Format orders for frontend
        orders_list = []
        for order in recent_orders:
            orders_list.append({
                'id': order['id'],
                'order_number': order['order_number'],
                'user_username': order['user__username'] or 'Guest',
                'status': order['status'],
                'total_amount': str(order['total_amount']),
                'created_at': order['created_at'].isoformat()
            })

        # Order status breakdown
        status_breakdown = {}
        for status, _ in Order.STATUS_CHOICES:
            status_breakdown[status] = Order.objects.filter(status=status).count()

        return Response({
            'totalOrders': total_orders,
            'pendingOrders': pending_orders,
            'completedOrders': completed_orders,
            'totalRevenue': total_revenue,
            'todayRevenue': today_revenue,
            'weekRevenue': week_revenue,
            'totalUsers': total_users,
            'newUsersToday': new_users_today,
            'newUsersWeek': new_users_week,
            'totalProducts': total_products,
            'outOfStock': out_of_stock,
            'lowStock': low_stock,
            'totalCategories': total_categories,
            'recentOrders': orders_list,
            'statusBreakdown': status_breakdown,
        })