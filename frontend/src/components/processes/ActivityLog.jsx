import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  getActivity,
  getAllActivity,
} from "../../services/graphService";


const ActivityLog = () => {

  const user = useSelector(
    (state) => state.auth?.user
  );

  const username =
    user?.username || "User";

  const userId = user?.id;

  const role = user?.role;


  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);


  /*
   * =========================================================
   * LOAD ACTIVITY
   * =========================================================
   */

  const loadActivity = async () => {

    if (!userId) {
      setActivities([]);
      setLoading(false);
      setError(
        "Unable to identify the logged-in user."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {

      let data;

      /*
       * Knowledge Architect:
       * GET /api/graphs/activity/all
       */

      if (
        role === "KNOWLEDGE_ARCHITECT"
      ) {

        data = await getAllActivity();

      } else {

        /*
         * Other users:
         * GET /api/graphs/activity?ownerId={id}
         */

        data = await getActivity(userId);

      }


      /*
       * Backend returns List<ActivityLog>.
       */

      if (Array.isArray(data)) {

        setActivities(data);

      } else if (
        Array.isArray(data?.content)
      ) {

        setActivities(data.content);

      } else {

        setActivities([]);

      }

    } catch (err) {

      setError(
        err.message ||
        "Unable to load activity logs."
      );

    } finally {

      setLoading(false);

    }
  };


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {

    loadActivity();

  }, [userId, role]);


  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */

  const handleRefresh = async () => {

    setRefreshing(true);

    await loadActivity();

    setRefreshing(false);

  };


  /*
   * =========================================================
   * FORMAT TIMESTAMP
   * =========================================================
   */

  const formatTimestamp = (timestamp) => {

    if (!timestamp) {
      return "—";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return String(timestamp);
    }

    return date.toLocaleString();

  };


  /*
   * =========================================================
   * ACTIVITY TYPE
   * =========================================================
   */

  const getActivityType = (activity) => {

    return (
      activity?.type ||
      activity?.activityType ||
      activity?.action ||
      "ACTIVITY"
    );

  };


  /*
   * =========================================================
   * ACTIVITY DESCRIPTION
   * =========================================================
   */

  const getDescription = (activity) => {

    /*
     * ActivityLog created by GraphController contains:
     *
     * type
     * targetTitle
     * ownerId
     */

    const type =
      activity?.type ||
      activity?.activityType ||
      activity?.action ||
      "ACTIVITY";

    const targetTitle =
      activity?.targetTitle;


    if (targetTitle) {

      return `${type} graph "${targetTitle}"`;

    }


    return (
      activity?.description ||
      activity?.message ||
      activity?.details ||
      "Activity performed in MindMesh."
    );

  };


  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */

  if (loading) {

    return (
      <section className="activity-log-section">

        <div className="activity-log-header">

          <div>

            <span className="section-label">
              ACTIVITY
            </span>

            <h2>
              Activity Logs
            </h2>

            <p>
              Track actions performed across
              your MindMesh workspace.
            </p>

          </div>

        </div>


        <div className="activity-state-card">

          <div className="activity-spinner"></div>

          <p>
            Loading activity logs...
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
      <section className="activity-log-section">

        <div className="activity-log-header">

          <div>

            <span className="section-label">
              ACTIVITY
            </span>

            <h2>
              Activity Logs
            </h2>

            <p>
              Track actions performed across
              your MindMesh workspace.
            </p>

          </div>


          <button
            type="button"
            className="graph-action-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing
              ? "Retrying..."
              : "Retry"}
          </button>

        </div>


        <div className="activity-error-card">

          <div className="activity-error-icon">
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
   * MAIN VIEW
   * =========================================================
   */

  return (
    <section className="activity-log-section">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="activity-log-header">

        <div>

          <span className="section-label">
            ACTIVITY
          </span>

          <h2>
            Activity Logs
          </h2>

          <p>
            Track actions performed across
            your MindMesh workspace.
          </p>

        </div>


        <button
          type="button"
          className="graph-action-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* ===================================================
          USER INFORMATION
          =================================================== */}

      <div className="activity-user-info">

        <div className="activity-user-avatar">
          {username
            .charAt(0)
            .toUpperCase()}
        </div>


        <div>

          <strong>
            {username}
          </strong>

          <span>
            {role || "USER"}
          </span>

        </div>

      </div>


      {/* ===================================================
          EMPTY STATE
          =================================================== */}

      {activities.length === 0 ? (

        <div className="activity-empty-card">

          <div className="activity-empty-icon">
            ◷
          </div>

          <h3>
            No activity yet
          </h3>

          <p>
            Activity generated by your
            MindMesh actions will appear here.
          </p>

        </div>

      ) : (


        /* =================================================
           ACTIVITY LIST
           ================================================= */

        <div className="activity-log-list">

          {activities.map(
            (activity, index) => {

              const type =
                getActivityType(activity);

              const description =
                getDescription(activity);

              const timestamp =
                activity?.timestamp ||
                activity?.createdAt ||
                activity?.time;


              return (
                <article
                  className="activity-log-item"
                  key={
                    activity?.id ||
                    `${type}-${index}`
                  }
                >

                  {/* Icon */}

                  <div className="activity-log-icon">

                    {type === "CREATE"
                      ? "+"
                      : type === "UPDATE"
                      ? "↻"
                      : type === "DELETE"
                      ? "×"
                      : "•"}

                  </div>


                  {/* Content */}

                  <div className="activity-log-content">

                    <div className="activity-log-title-row">

                      <h3>
                        {type}
                      </h3>

                      <span className="activity-type">
                        {type}
                      </span>

                    </div>


                    <p>
                      {description}
                    </p>

                  </div>


                  {/* Time */}

                  <time
                    className="activity-log-time"
                    dateTime={
                      timestamp || undefined
                    }
                  >
                    {formatTimestamp(timestamp)}
                  </time>

                </article>
              );

            }
          )}

        </div>

      )}


      {/* ===================================================
          FOOTER
          =================================================== */}

      <div className="activity-log-footer">

        <span>
          {activities.length}{" "}
          {activities.length === 1
            ? "activity"
            : "activities"}
        </span>


        <span>
          Signed in as {username}
        </span>

      </div>

    </section>
  );
};


export default ActivityLog;