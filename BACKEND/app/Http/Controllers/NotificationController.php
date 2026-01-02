<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get user notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        $notifications = Notification::forUser($user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $unreadCount = Notification::forUser($user->id)->unread()->count();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        
        $notification = Notification::forUser($user->id)->find($id);
        
        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        Notification::forUser($user->id)->unread()->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Delete notification
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        
        $notification = Notification::forUser($user->id)->find($id);
        
        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted',
        ]);
    }

    /**
     * Get unread count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        $count = Notification::forUser($user->id)->unread()->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get admin notifications
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $notifications = Notification::forAdmin()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $unreadCount = Notification::forAdmin()->unread()->count();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark admin notification as read
     */
    public function adminMarkAsRead(Request $request, int $id): JsonResponse
    {
        $notification = Notification::forAdmin()->find($id);
        
        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Mark all admin notifications as read
     */
    public function adminMarkAllAsRead(Request $request): JsonResponse
    {
        Notification::forAdmin()->unread()->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Get admin unread count
     */
    public function adminUnreadCount(Request $request): JsonResponse
    {
        $count = Notification::forAdmin()->unread()->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }
}
