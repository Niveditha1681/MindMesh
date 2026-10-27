import React, {
  useEffect,
  useRef,
} from "react";

import "./MeshBackground.css";


const MeshBackground = ({
  children,
}) => {

  const canvasRef =
    useRef(null);


  useEffect(() => {

    const canvas =
      canvasRef.current;


    if (!canvas) {

      return;

    }


    const ctx =
      canvas.getContext("2d");


    let animationFrame;


    /*
     * =====================================================
     * GENERATE KNOWLEDGE MESH
     * =====================================================
     */

    const generateMeshBackground = () => {

      const width =
        window.innerWidth;


      const height =
        window.innerHeight;


      /*
       * Canvas size.
       */

      canvas.width =
        width;


      canvas.height =
        height;


      /*
       * ===================================================
       * COLORS
       * ===================================================
       */

      const bgColorCenter =
        "#151b33";


      const bgColorEdge =
        "#0B0E1A";


      const nodeColor =
        "rgba(154, 161, 188, 0.55)";


      const accentColorA =
        "#D9A94E";


      const accentColorB =
        "#8B7FE8";


      const edgeColor =
        "rgba(139, 151, 189,";


      /*
       * ===================================================
       * BACKGROUND GRADIENT
       * ===================================================
       */

      const base =
        ctx.createRadialGradient(

          width * 0.25,
          height * 0.2,
          0,

          width * 0.25,
          height * 0.2,
          width * 0.9

        );


      base.addColorStop(
        0,
        bgColorCenter
      );


      base.addColorStop(
        1,
        bgColorEdge
      );


      ctx.fillStyle =
        base;


      ctx.fillRect(
        0,
        0,
        width,
        height
      );


      /*
       * ===================================================
       * AMBIENT GLOW — LEFT
       * ===================================================
       */

      const leftGlow =
        ctx.createRadialGradient(

          width * 0.18,
          height * 0.22,
          0,

          width * 0.18,
          height * 0.22,
          420

        );


      leftGlow.addColorStop(
        0,
        "rgba(139,127,232,0.20)"
      );


      leftGlow.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );


      ctx.fillStyle =
        leftGlow;


      ctx.fillRect(
        0,
        0,
        width,
        height
      );


      /*
       * ===================================================
       * AMBIENT GLOW — RIGHT
       * ===================================================
       */

      const rightGlow =
        ctx.createRadialGradient(

          width * 0.82,
          height * 0.78,
          0,

          width * 0.82,
          height * 0.78,
          460

        );


      rightGlow.addColorStop(
        0,
        "rgba(217,169,78,0.16)"
      );


      rightGlow.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );


      ctx.fillStyle =
        rightGlow;


      ctx.fillRect(
        0,
        0,
        width,
        height
      );


      /*
       * ===================================================
       * GRID LINES
       *
       * Added because your Dashboard screenshot has
       * a subtle grid structure.
       * ===================================================
       */

      ctx.strokeStyle =
        "rgba(110,130,180,0.06)";


      ctx.lineWidth =
        1;


      const gridSize =
        104;


      for (

        let x = 0;

        x < width;

        x += gridSize

      ) {

        ctx.beginPath();

        ctx.moveTo(
          x,
          0
        );

        ctx.lineTo(
          x,
          height
        );

        ctx.stroke();

      }


      for (

        let y = 0;

        y < height;

        y += gridSize

      ) {

        ctx.beginPath();

        ctx.moveTo(
          0,
          y
        );

        ctx.lineTo(
          width,
          y
        );

        ctx.stroke();

      }


      /*
       * ===================================================
       * CREATE NODES
       * ===================================================
       */

      const nodeDensity =
        22000;


      const minNodes =
        40;


      const nodeCount =
        Math.max(

          minNodes,

          Math.floor(
            (width * height) /
            nodeDensity
          )

        );


      const nodes =
        [];


      for (

        let index = 0;

        index < nodeCount;

        index++

      ) {

        nodes.push({

          x:
            Math.random() * width,


          y:
            Math.random() * height,


          r:

            1.4 +

            Math.random() *

            (3.6 - 1.4),

        });

      }


      /*
       * ===================================================
       * CONNECT NODES
       * ===================================================
       */

      const maxEdgeDist =
        130;


      const edgeChance =
        0.5;


      ctx.lineWidth =
        1;


      for (

        let i = 0;

        i < nodes.length;

        i++

      ) {

        for (

          let j = i + 1;

          j < nodes.length;

          j++

        ) {

          const dx =
            nodes[i].x -
            nodes[j].x;


          const dy =
            nodes[i].y -
            nodes[j].y;


          const distance =
            Math.sqrt(

              dx * dx +

              dy * dy

            );


          if (

            distance < maxEdgeDist &&

            Math.random() < edgeChance

          ) {

            ctx.strokeStyle =

              `${edgeColor}${
                (
                  0.08 +
                  Math.random() * 0.08
                ).toFixed(2)
              })`;


            ctx.beginPath();


            ctx.moveTo(

              nodes[i].x,

              nodes[i].y

            );


            ctx.lineTo(

              nodes[j].x,

              nodes[j].y

            );


            ctx.stroke();

          }

        }

      }


      /*
       * ===================================================
       * DRAW NODES
       * ===================================================
       */

      nodes.forEach((node) => {

        const roll =
          Math.random();


        let color =
          nodeColor;


        let glowColor =
          null;


        /*
         * Gold nodes.
         */

        if (roll < 0.10) {

          color =
            accentColorA;


          glowColor =
            accentColorA;

        }


        /*
         * Violet nodes.
         */

        else if (roll < 0.20) {

          color =
            accentColorB;


          glowColor =
            accentColorB;

        }


        /*
         * Glow.
         */

        if (glowColor) {

          ctx.shadowColor =
            glowColor;


          ctx.shadowBlur =
            10;

        }

        else {

          ctx.shadowBlur =
            0;

        }


        /*
         * Draw node.
         */

        ctx.fillStyle =
          color;


        ctx.beginPath();


        ctx.arc(

          node.x,

          node.y,

          node.r,

          0,

          Math.PI * 2

        );


        ctx.fill();


        ctx.shadowBlur =
          0;

      });

    };


    /*
     * =====================================================
     * INITIAL DRAW
     * =====================================================
     */

    generateMeshBackground();


    /*
     * =====================================================
     * RESIZE HANDLER
     * =====================================================
     */

    const handleResize = () => {

      cancelAnimationFrame(
        animationFrame
      );


      animationFrame =
        requestAnimationFrame(
          generateMeshBackground
        );

    };


    window.addEventListener(
      "resize",
      handleResize
    );


    /*
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );


      cancelAnimationFrame(
        animationFrame
      );

    };


  }, []);


  /*
   * =======================================================
   * UI
   * =======================================================
   */

  return (

    <div className="mesh-background">

      <canvas
        ref={canvasRef}
        className="mesh-background-canvas"
      />


      <div className="mesh-background-content">

        {children}

      </div>

    </div>

  );

};


export default MeshBackground;