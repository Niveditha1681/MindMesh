export function generateMeshBackground(options = {}) {

  const width =
    options.width || window.innerWidth;

  const height =
    options.height || window.innerHeight;


  const canvas =
    document.createElement("canvas");


  canvas.width =
    width;


  canvas.height =
    height;


  const ctx =
    canvas.getContext("2d");


  /*
   * =========================================================
   * BACKGROUND
   * =========================================================
   */

  const backgroundGradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      height
    );


  backgroundGradient.addColorStop(
    0,
    "#11182d"
  );


  backgroundGradient.addColorStop(
    0.5,
    "#0b1120"
  );


  backgroundGradient.addColorStop(
    1,
    "#111018"
  );


  ctx.fillStyle =
    backgroundGradient;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /*
   * =========================================================
   * AMBIENT PURPLE GLOW
   * =========================================================
   */

  const purpleGlow =
    ctx.createRadialGradient(
      width * 0.12,
      height * 0.18,
      0,
      width * 0.12,
      height * 0.18,
      width * 0.55
    );


  purpleGlow.addColorStop(
    0,
    "rgba(75, 70, 140, 0.25)"
  );


  purpleGlow.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );


  ctx.fillStyle =
    purpleGlow;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /*
   * =========================================================
   * GOLD AMBIENT GLOW
   * =========================================================
   */

  const goldGlow =
    ctx.createRadialGradient(
      width * 0.85,
      height * 0.75,
      0,
      width * 0.85,
      height * 0.75,
      width * 0.45
    );


  goldGlow.addColorStop(
    0,
    "rgba(150, 100, 40, 0.16)"
  );


  goldGlow.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );


  ctx.fillStyle =
    goldGlow;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /*
   * =========================================================
   * CREATE CLUSTERS
   *
   * This is the important difference.
   * Instead of randomly scattering every node,
   * we create groups of nodes.
   * =========================================================
   */

  const nodes =
    [];


  const clusterCount =
    Math.max(
      10,
      Math.floor(
        width / 180
      )
    );


  for (
    let clusterIndex = 0;
    clusterIndex < clusterCount;
    clusterIndex++
  ) {


    const centerX =
      Math.random() * width;


    const centerY =
      Math.random() * height;


    const nodesInCluster =
      4 +
      Math.floor(
        Math.random() * 6
      );


    const clusterRadius =
      90 +
      Math.random() * 140;


    for (
      let i = 0;
      i < nodesInCluster;
      i++
    ) {


      const angle =
        Math.random() *
        Math.PI *
        2;


      const distance =
        Math.random() *
        clusterRadius;


      nodes.push({

        x:
          centerX +
          Math.cos(angle) *
          distance,

        y:
          centerY +
          Math.sin(angle) *
          distance,

        radius:
          1.5 +
          Math.random() * 2.5,

        cluster:
          clusterIndex,

      });

    }

  }


  /*
   * =========================================================
   * DRAW CONNECTIONS
   * =========================================================
   */

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


      const nodeA =
        nodes[i];


      const nodeB =
        nodes[j];


      const dx =
        nodeA.x -
        nodeB.x;


      const dy =
        nodeA.y -
        nodeB.y;


      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      /*
       * Nodes in the same cluster get
       * stronger connections.
       */

      const sameCluster =
        nodeA.cluster ===
        nodeB.cluster;


      const maxDistance =
        sameCluster
          ? 230
          : 140;


      if (
        distance < maxDistance
      ) {


        const connectionChance =
          sameCluster
            ? 0.72
            : 0.12;


        if (
          Math.random() <
          connectionChance
        ) {


          const opacity =
            sameCluster
              ? 0.22
              : 0.08;


          ctx.strokeStyle =
            `rgba(115, 135, 180, ${opacity})`;


          ctx.beginPath();


          ctx.moveTo(
            nodeA.x,
            nodeA.y
          );


          ctx.lineTo(
            nodeB.x,
            nodeB.y
          );


          ctx.stroke();

        }

      }

    }

  }


  /*
   * =========================================================
   * DRAW NODES
   * =========================================================
   */

  nodes.forEach(
    (node) => {


      const random =
        Math.random();


      let color =
        "rgba(150, 165, 195, 0.75)";


      let glow =
        null;


      /*
       * GOLD NODE
       */

      if (
        random < 0.08
      ) {

        color =
          "#d9a94e";


        glow =
          "#d9a94e";

      }


      /*
       * PURPLE NODE
       */

      else if (
        random < 0.16
      ) {

        color =
          "#8b7fe8";


        glow =
          "#8b7fe8";

      }


      if (glow) {

        ctx.shadowColor =
          glow;


        ctx.shadowBlur =
          12;

      }


      ctx.fillStyle =
        color;


      ctx.beginPath();


      ctx.arc(
        node.x,
        node.y,
        node.radius,
        0,
        Math.PI * 2
      );


      ctx.fill();


      ctx.shadowBlur =
        0;

    }
  );


  return canvas.toDataURL(
    "image/png"
  );

}