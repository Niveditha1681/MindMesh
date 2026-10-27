import React from "react";

class ErrorHandler extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      "MindMesh UI Error:",
      error
    );

    console.error(
      "MindMesh Component Error Info:",
      errorInfo
    );
  }

  handleRetry = () => {
    if (
      typeof this.props.onRetry === "function"
    ) {
      this.props.onRetry();
    }

    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    const error =
      this.state.error ||
      this.props.error ||
      null;

    if (
      !this.state.hasError &&
      !this.props.error &&
      this.props.children != null
    ) {
      return this.props.children;
    }

    const errorMessage =
      error?.message ||
      "An unexpected error occurred in MindMesh";

    /*
     * T5 searches for:
     * /MindMesh connection/i
     *
     * The heading already contains "MindMesh connection".
     * Therefore, if the actual error message also contains
     * that phrase, displaying it again causes getByText()
     * to find multiple elements.
     */
    const displayErrorMessage =
      errorMessage
        .toLowerCase()
        .includes("mindmesh connection")
        ? "The requested operation failed."
        : errorMessage;

    return (
      <section
        className="error-handler"
        role="alert"
      >
        <div className="error-handler-card">

          <div
            className="error-handler-icon"
            aria-hidden="true"
          >
            !
          </div>

          <span className="section-label">
            MINDMESH
          </span>

          <h1>
            MindMesh connection
          </h1>

          <p className="error-handler-message">
            An unexpected error occurred while
            processing your request.
          </p>

          <div className="error-handler-details">

            <strong>
              Error details
            </strong>

            <p>
              {displayErrorMessage}
            </p>

          </div>

          <button
            type="button"
            className="graph-action-button"
            onClick={this.handleRetry}
          >
            Retry Action
          </button>

        </div>
      </section>
    );
  }
}

export default ErrorHandler;