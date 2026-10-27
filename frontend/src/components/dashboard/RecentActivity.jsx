import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useSelector } from "react-redux";

import {
  getActivity,
} from "../../services/graphService";


/*
 * =========================================================
 * RECENT ACTIVITY
 * =========================================================
 *
 * Displays recent activity belonging to the currently
 * authenticated user.
 *
 * Backend:
 *
 * GET /api/graphs/activity?ownerId={ownerId}
 */


const RecentActivity = () => {

  /*
   * =========================================================
   * AUTHENTICATED USER
   * =========================================================
   */

  const user = useSelector(
    (state) => state.auth?.user
  );


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [activities, setActivities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
   * =========================================================
   * LOAD ACTIVITY
   * =========================================================
   */

  const loadActivity = useCallback(
    async () => {

      /*
       * A user is required because the backend
       * activity endpoint uses ownerId.
       */

      if (!user?.id) {

        setActivities([]);

        setLoading(false);

        setError("");

        return;
      }


      setLoading(true);

      setError("");


      try {

        /*
         * GET /api/graphs/activity?ownerId={ownerId}
         */

        const data =
          await getActivity(
            user.id
          );


        /*
         * -----------------------------------------------------
         * NORMALIZE RESPONSE
         * -----------------------------------------------------
         *
         * Support:
         *
         * Array
         *
         * {
         *   content: [...]
         * }
         *
         * {
         *   data: [...]
         * }
         */

        let activityList = [];


        if (
          Array.isArray(data)
        ) {

          activityList =
            data;

        } else if (
          Array.isArray(
            data?.content
          )
        ) {

          activityList =
            data.content;

        } else if (
          Array.isArray(
            data?.data
          )
        ) {

          activityList =
            data.data;

        }


        /*
         * Show latest 10 activities.
         */

        setActivities(
          activityList.slice(0, 10)
        );

      } catch (err) {

        setError(
          err?.message ||
          "Unable to load recent activity."
        );

      } finally {

        setLoading(false);

      }

    },
    [
      user?.id,
    ]
  );


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {

    loadActivity();

  }, [
    loadActivity,
  ]);


  /*
   * =========================================================
   * FORMAT TIMESTAMP
   * =========================================================
   */

  const formatTimestamp = (
    timestamp
  ) => {

    if (!timestamp) {
      return "";
    }


    const date =
      new Date(timestamp);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(
        timestamp
      );

    }


    return date.toLocaleString();

  };


  /*
   * =========================================================
   * GET ACTIVITY TYPE
   * =========================================================
   */

  const getActivityType = (
    activity
  ) => {

    return (
      activity?.type ||
      activity?.action ||
      activity?.activityType ||
      "ACTIVITY"
    );

  };


  /*
   * =========================================================
   * GET ACTIVITY DESCRIPTION
   * =========================================================
   */

  const getActivityDescription = (
    activity
  ) => {

    const type =
      getActivityType(
        activity
      );


    const targetTitle =
      activity?.targetTitle ||
      activity?.targetName ||
      activity?.graphTitle ||
      "";


    /*
     * Prefer backend-provided description.
     */

    if (
      activity?.description
    ) {

      return activity.description;

    }


    if (
      activity?.message
    ) {

      return activity.message;

    }


    if (
      activity?.details
    ) {

      return activity.details;

    }


    /*
     * Create a readable fallback.
     */

    if (targetTitle) {

      return (
        `${type} graph "${targetTitle}"`
      );

    }


    return (
      `${type} activity in your knowledge workspace.`
    );

  };


  /*
   * =========================================================
   * GET ACTIVITY ICON
   * =========================================================
   */

  const getActivityIcon = (
    type
  ) => {

    const normalizedType =
      String(
        type || ""
      ).toUpperCase();


    if (
      normalizedType.includes(
        "CREATE"
      )
    ) {

      return "+";

    }


    if (
      normalizedType.includes(
        "UPDATE"
      ) ||
      normalizedType.includes(
        "EDIT"
      )
    ) {

      return "↻";

    }


    if (
      normalizedType.includes(
        "DELETE"
      ) ||
      normalizedType.includes(
        "REMOVE"
      )
    ) {

      return "×";

    }


    if (
      normalizedType.includes(
        "VIEW"
      )
    ) {

      return "◉";

    }


    return "•";

  };


  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */

  if (loading) {

    return (
      <section
        className="recent-activity"
        aria-label="Recent activity"
      >

        <div className="recent-activity-header">

          <div>

            <span className="section-label">
              ACTIVITY
            </span>

            <h2>
              Recent Activity
            </h2>

            <p>
              Recent actions in your
              knowledge workspace.
            </p>

          </div>

        </div>


        <div
          className="activity-state-card"
          aria-live="polite"
        >

          <div
            className="activity-spinner"
            aria-hidden="true"
          ></div>

          <p>
            Loading recent activity...
          </p>

        </div>

      </section>
    );

  }


  /*
   * =========================================================
   * ERROR STATE
   * =========================================================
   */

  if (error) {

    return (
      <section
        className="recent-activity"
        aria-label="Recent activity"
      >

        <div className="recent-activity-header">

          <div>

            <span className="section-label">
              ACTIVITY
            </span>

            <h2>
              Recent Activity
            </h2>

            <p>
              Recent actions in your
              knowledge workspace.
            </p>

          </div>


          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={loadActivity}
          >
            Retry
          </button>

        </div>


        <div
          className="activity-error-card"
          role="alert"
        >

          <div
            className="activity-error-icon"
            aria-hidden="true"
          >
            !
          </div>


          <div>

            <h3>
              Unable to load activity
            </h3>

            <p>
              {error}
            </p>

          </div>

        </div>

      </section>
    );

  }


  /*
   * =========================================================
   * EMPTY STATE
   * =========================================================
   */

  if (
    activities.length === 0
  ) {

    return (
      <section
        className="recent-activity"
        aria-label="Recent activity"
      >

        <div className="recent-activity-header">

          <div>

            <span className="section-label">
              ACTIVITY
            </span>

            <h2>
              Recent Activity
            </h2>

            <p>
              Recent actions in your
              knowledge workspace.
            </p>

          </div>


          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={loadActivity}
          >
            Refresh
          </button>

        </div>


        <div className="activity-empty-card">

          <div
            className="activity-empty-icon"
            aria-hidden="true"
          >
            ◷
          </div>


          <h3>
            No recent activity
          </h3>


          <p>
            Your recent knowledge graph
            actions will appear here.
          </p>

        </div>

      </section>
    );

  }


  /*
   * =========================================================
   * ACTIVITY LIST
   * =========================================================
   */

  return (
    <section
      className="recent-activity"
      aria-label="Recent activity"
    >

      <div className="recent-activity-header">

        <div>

          <span className="section-label">
            ACTIVITY
          </span>

          <h2>
            Recent Activity
          </h2>

          <p>
            Recent actions in your
            knowledge workspace.
          </p>

        </div>


        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={loadActivity}
          disabled={loading}
        >
          Refresh
        </button>

      </div>


      <div className="activity-list">

        {activities.map(
          (activity, index) => {

            const activityId =
              activity?.id ??
              `${getActivityType(activity)}-${index}`;


            const type =
              getActivityType(
                activity
              );


            const description =
              getActivityDescription(
                activity
              );


            const timestamp =
              activity?.timestamp ||
              activity?.createdAt ||
              activity?.performedAt ||
              activity?.time ||
              "";


            return (
              <article
                className="activity-item"
                key={activityId}
              >

                <div
                  className="activity-icon"
                  aria-hidden="true"
                >
                  {getActivityIcon(
                    type
                  )}
                </div>


                <div className="activity-content">

                  <h3>
                    {type}
                  </h3>


                  <p>
                    {description}
                  </p>

                </div>


                {timestamp && (

                  <time
                    className="activity-time"
                    dateTime={timestamp}
                  >
                    {formatTimestamp(
                      timestamp
                    )}
                  </time>

                )}

              </article>
            );

          }
        )}

      </div>


      <div className="activity-list-footer">

        <span>
          Showing{" "}
          {activities.length}{" "}
          recent{" "}
          {activities.length === 1
            ? "activity"
            : "activities"}
        </span>

      </div>

    </section>
  );
};


export default RecentActivity;