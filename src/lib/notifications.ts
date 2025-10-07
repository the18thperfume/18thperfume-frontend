/**
 * Notification utility for displaying success, error, and info messages
 * This is a simple implementation - can be replaced with a proper toast library
 */

export interface NotificationOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  type?: 'success' | 'error' | 'warning' | 'info';
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, HTMLElement> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private createNotificationElement(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info',
    duration: number
  ): HTMLElement {
    const notification = document.createElement('div');
    const id = Date.now().toString();
    
    notification.className = `
      fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm
      transform transition-all duration-300 ease-in-out
      ${this.getTypeClasses(type)}
    `.trim();

    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${this.getIcon(type)}
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button class="inline-flex text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.parentElement.remove()">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
        this.notifications.delete(id);
      }
    }, duration);

    this.notifications.set(id, notification);
    return notification;
  }

  private getTypeClasses(type: string): string {
    const classes = {
      success: 'bg-green-50 border border-green-200 text-green-800',
      error: 'bg-red-50 border border-red-200 text-red-800',
      warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border border-blue-200 text-blue-800'
    };
    return classes[type as keyof typeof classes] || classes.info;
  }

  private getIcon(type: string): string {
    const icons = {
      success: `<svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>`,
      error: `<svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>`,
      warning: `<svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>`,
      info: `<svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
             </svg>`
    };
    return icons[type as keyof typeof icons] || icons.info;
  }

  show(message: string, options: NotificationOptions = {}): void {
    if (typeof window === 'undefined') return; // Server-side guard
    
    const {
      duration = 5000,
      type = 'info'
    } = options;

    const notification = this.createNotificationElement(message, type, duration);
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });
  }

  success(message: string, options: Omit<NotificationOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'success' });
  }

  error(message: string, options: Omit<NotificationOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'error' });
  }

  warning(message: string, options: Omit<NotificationOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'warning' });
  }

  info(message: string, options: Omit<NotificationOptions, 'type'> = {}): void {
    this.show(message, { ...options, type: 'info' });
  }

  clear(): void {
    this.notifications.forEach(notification => {
      if (notification.parentElement) {
        notification.remove();
      }
    });
    this.notifications.clear();
  }
}

// Export singleton instance
export const notifications = NotificationService.getInstance();

// Convenience functions
export const showSuccess = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  notifications.success(message, options);

export const showError = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  notifications.error(message, options);

export const showWarning = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  notifications.warning(message, options);

export const showInfo = (message: string, options?: Omit<NotificationOptions, 'type'>) => 
  notifications.info(message, options);

export default notifications;
