import React from "react";
import "./GlobalMeshBackground.css";

const GlobalMeshBackground = () => {
  return (
    <div
      className="mesh-background"
      aria-hidden="true"
    >
      {/* BASE GRADIENT */}

      <div className="mesh-base-gradient" />

      {/* AMBIENT GLOWS */}

      <div className="mesh-glow mesh-glow-one" />
      <div className="mesh-glow mesh-glow-two" />
      <div className="mesh-glow mesh-glow-three" />

      {/* ANIMATED CONNECTION LINES */}

      <div className="mesh-line mesh-line-one" />
      <div className="mesh-line mesh-line-two" />
      <div className="mesh-line mesh-line-three" />
      <div className="mesh-line mesh-line-four" />

      {/* FLOATING NODES */}

      <span className="floating-node node-one" />
      <span className="floating-node node-two" />
      <span className="floating-node node-three" />
      <span className="floating-node node-four" />
      <span className="floating-node node-five" />
      <span className="floating-node node-six" />
      <span className="floating-node node-seven" />
      <span className="floating-node node-eight" />
      <span className="floating-node node-nine" />
      <span className="floating-node node-ten" />
      <span className="floating-node node-eleven" />
      <span className="floating-node node-twelve" />

      {/* VIGNETTE */}

      <div className="mesh-vignette" />
    </div>
  );
};

export default GlobalMeshBackground;