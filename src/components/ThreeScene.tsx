// components/ThreeScene.tsx
import { FC, useCallback, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { DataEdge, DataNode } from "@/data/pdfData";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Edge,
  createLabel,
  createNode,
  updateLabels,
  nodeMaterial,
  createEdge,
} from "@/utils";

interface IThreeSceneProps {
  pdfNodes?: DataNode[];
  pdfEdges?: DataEdge[];
  updateEdge?: (edge: DataEdge | undefined) => void;
}

const ThreeScene: FC<IThreeSceneProps> = ({
  pdfNodes,
  pdfEdges,
  updateEdge,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  const selectEdge = useCallback(
    (
      edge: THREE.Line<THREE.BufferGeometry, THREE.Material> | undefined,
      edges?: Edge[]
    ) => {
      if (edge && edges?.length && pdfEdges?.length) {
        const [matchedEdge] = edges.filter((e) => e.line.uuid === edge.uuid);
        const [selectedEdge] = pdfEdges.filter((e) => e.id === matchedEdge.id);
        selectedEdge && updateEdge?.(selectedEdge);
      } else {
        updateEdge?.(undefined);
      }
    },
    [pdfEdges, updateEdge]
  );

  useEffect(() => {
    const mount = mountRef.current!;

    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Position the camera
    camera.position.z = 6;

    // Declare nodes and labels
    const nodes: THREE.Mesh[] = [];
    const labels: THREE.Sprite[] = [];

    pdfNodes?.forEach((nodeData: DataNode) => {
      const node = createNode(nodeData);
      const label = createLabel(nodeData.name);
      scene.add(node);
      scene.add(label);
      labels.push(label);
      nodes.push(node);
    });

    // Create edges (lines) connecting the nodes
    const edges: {
      line: THREE.Line;
      label: THREE.Sprite;
      text: string;
      id: number;
    }[] = [];

    // Connect nodes with edges
    pdfEdges?.forEach((edge) => {
      const sourceNode = nodes.find((node) => node.userData.id === edge.source);
      const targetNode = nodes.find((node) => node.userData.id === edge.target);
      if (sourceNode && targetNode) {
        const { line, label, text, id } = createEdge(
          sourceNode,
          targetNode,
          edge.value,
          edge.id
        );
        scene.add(line);
        scene.add(label);
        edges.push({ line, label, text, id });
      }
    });

    // Render loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      if (nodes.length && edges.length) {
        updateLabels(labels, nodes, edges);
      }
    }
    animate();

    // Handle window resize
    mount.addEventListener("resize", () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.render(scene, camera);
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", () => {
      renderer.render(scene, camera); // render whenever the OrbitControls changes
    });

    // Handle mouse click
    mount.addEventListener("click", onClick, false);

    function onClick(event: MouseEvent) {
      event.preventDefault();

      const rect = mount.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const intersects = raycasterRef.current.intersectObjects(
        edges.map((edge) => edge.line)
      );

      if (intersects.length) {
        const [matchedIntersectedEdge] = intersects;
        const intersectedEdge = matchedIntersectedEdge.object as THREE.Line<
          THREE.BufferGeometry,
          THREE.Material
        >;
        selectEdge(intersectedEdge, edges);
      } else {
        selectEdge(undefined, edges);
      }
    }

    // Clean up on unmount
    return () => {
      mount.removeChild(renderer.domElement);
      scene.remove(...nodes, ...labels);
      nodeMaterial.dispose();
    };
  }, [pdfEdges, pdfNodes, selectEdge]);

  return <div ref={mountRef} style={{ width: "100%", height: "800px" }} />;
};

export default ThreeScene;
