import React, { useEffect } from "react";


/*
 * =========================================================
 * NOTIFICATION STACK
 * =========================================================
 *
 * Displays temporary notification messages.
 *
 * Expected notification structure can be:
 *
 * {
 *   id: 1,
 *   message: "Graph created successfully",
 *   type: "success"
 * }
 *
 * Supported types:
 *
 * success
 * error
 * warning
 * info
 *
 * The component automatically dismisses notifications
 * after the configured timeout.
 */


const NotificationStack = ({
  notifications = [],
  onDismiss,
  timeout = 4000,
}) => {


  /*
   * =========================================================
   * SAFE NOTIFICATION LIST
   * =========================================================
   */

  const notificationList =
    Array.isArray(notifications)
      ? notifications
      : [];


  /*
   * =========================================================
   * AUTO DISMISS
   * =========================================================
   *
   * Each notification gets its own timeout.
   */

  useEffect(() => {

    if (notificationList.length === 0) {
      return undefined;
    }


    const timers =
      notificationList.map(
        (notification, index) => {

          const notificationId =
            notification?.id ?? index;


          return setTimeout(() => {

            if (onDismiss) {
              onDismiss(notificationId);
            }

          }, timeout);

        }
      );


    /*
     * Cleanup timers when the component
     * is unmounted or notifications change.
     */

    return () => {

      timers.forEach((timer) => {
        clearTimeout(timer);
      });

    };

  }, [
    notifications,
    onDismiss,
    timeout,
  ]);


  /*
   * =========================================================
   * EMPTY
   * =========================================================
   */

  if (notificationList.length === 0) {
    return null;
  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      className="notification-stack"
      aria-live="polite"
      aria-atomic="false"
    >

      {notificationList.map(
        (notification, index) => {

          const notificationId =
            notification?.id ?? index;


          const type =
            notification?.type ||
            "info";


          const message =
            notification?.message ||
            notification?.text ||
            notification?.content ||
            "";


          const title =
            notification?.title ||
            "";


          return (
            <div
              className={`notification-item notification-${type}`}
              key={notificationId}
              role={
                type === "error"
                  ? "alert"
                  : "status"
              }
            >

              {/* Notification icon */}

              <div
                className="notification-icon"
                aria-hidden="true"
              >
                {type === "success"
                  ? "✓"
                  : type === "error"
                  ? "!"
                  : type === "warning"
                  ? "⚠"
                  : "i"}
              </div>


              {/* Notification content */}

              <div className="notification-content">

                {title && (
                  <strong>
                    {title}
                  </strong>
                )}

                <p>
                  {message}
                </p>

              </div>


              {/* Manual dismiss */}

              {onDismiss && (
                <button
                  type="button"
                  className="notification-dismiss"
                  aria-label="Dismiss notification"
                  onClick={() =>
                    onDismiss(notificationId)
                  }
                >
                  ×
                </button>
              )}

            </div>
          );

        }
      )}

    </div>
  );
};


export default NotificationStack;