// components/ThreeScene.tsx
import { FC, useCallback, useEffect, useRef, useMemo, useState } from "react";
import * as THREE from "three";
import styled from "styled-components";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { Loading } from "@/components";
import { DataEdge, DataNode } from "@/data/pdfData";
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
  const [loading, setLoading] = useState(true);

  const selectEdge = useCallback(
    (edge: THREE.LineSegments | undefined, edges?: Edge[]) => {
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

  const getPdf = useCallback(
    async (
      pdfUrl: string,
      node: THREE.Mesh<THREE.BufferGeometry>,
      scene: THREE.Scene
    ) => {
      const loadingTask = getDocument(pdfUrl);

      try {
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get 2D context");
        }
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.PlaneGeometry(
          viewport.width / 500,
          viewport.height / 500
        );
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          node.position.x,
          node.position.y,
          node.position.z - 1
        );
        scene.add(mesh);
      } catch (error) {
        console.error("Error loading PDF", error);
      }
    },
    []
  );

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
    const nodes: THREE.Mesh[] = [];
    const labels: THREE.Sprite[] = [];
    const scene = new THREE.Scene();
    const mount = mountRef.current!;
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

    pdfNodes?.forEach(async (nodeData: DataNode) => {
      const node = createNode(nodeData);
      const label = createLabel(nodeData.name);

      scene.add(node);
      scene.add(label);
      labels.push(label);
      nodes.push(node);
      await getPdf(nodeData.path, node, scene);
    });

    // Create edges (lines) connecting the nodes
    const edges: {
      line: THREE.LineSegments;
      label: THREE.Sprite;
      text: string;
      id: number;
    }[] = [];

    // Connect edges with nodes
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.addEventListener("change", () => {
      renderer.render(scene, camera); // render whenever the OrbitControls changes
    });

    // Render loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
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

    // Handle mouse click
    mount.addEventListener("click", onClick, false);

    function onClick(event: MouseEvent) {
      event.preventDefault();

      const rect = mount.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      raycasterRef.current.params.Line.threshold = 0.1;

      const intersects = raycasterRef.current.intersectObjects(
        edges.map((edge) => edge.line)
      );

      if (intersects.length) {
        const [matchedIntersectedEdge] = intersects;
        const intersectedEdge =
          matchedIntersectedEdge.object as THREE.LineSegments;
        selectEdge(intersectedEdge, edges);
      } else {
        selectEdge(undefined, edges);
      }
    }

    if (mountRef.current) setLoading(false);

    // Clean up on unmount
    return () => {
      mount.removeChild(renderer.domElement);
      scene.remove(...nodes, ...labels);
      nodeMaterial.dispose();
    };
  }, [getPdf, pdfEdges, pdfNodes, selectEdge]);

  return (
    <>
      <StyledCanvas ref={mountRef} />
      {loading && (
        <StyledLoading>
          <Loading />
        </StyledLoading>
      )}
    </>
  );
};

export default ThreeScene;

const StyledCanvas = styled.div`
  width: 100%;
  height: 600px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
`;

const StyledLoading = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 600px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
`;
