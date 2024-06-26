import { FC, useCallback, useEffect, useRef, useState } from "react";
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
        const matchedEdge = edges.find((e) => e.line.uuid === edge.uuid);
        const selectedEdge = pdfEdges.find((e) => e.id === matchedEdge?.id);
        updateEdge?.(selectedEdge);
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
        if (!context) throw new Error("Could not get 2D context");

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
    const edges: Edge[] = [];
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

    camera.position.z = 6;

    const loadNodes = async () => {
      try {
        const nodePromises = (pdfNodes || []).map(
          async (nodeData: DataNode) => {
            const node = createNode(nodeData);
            const label = createLabel(nodeData.name);
            scene.add(node);
            scene.add(label);
            labels.push(label);
            nodes.push(node);
            return getPdf(nodeData.path, node, scene);
          }
        );
        await Promise.all(nodePromises);
      } finally {
        setLoading(false);
      }
    };

    loadNodes();

    const loadEdges = () => {
      pdfEdges?.forEach((edge) => {
        const sourceNode = nodes.find(
          (node) => node.userData.id === edge.source
        );
        const targetNode = nodes.find(
          (node) => node.userData.id === edge.target
        );
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
    };

    loadEdges();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.maxPolarAngle = Math.PI / 2;
    controls.addEventListener("change", () => {
      renderer.render(scene, camera);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      if (nodes.length && edges.length) {
        updateLabels(labels, nodes, edges);
      }
    };
    animate();

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const onClick = (event: MouseEvent) => {
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
        const intersectedEdge = intersects[0].object as THREE.LineSegments;
        selectEdge(intersectedEdge, edges);
      } else {
        selectEdge(undefined, edges);
      }
    };

    window.addEventListener("resize", handleResize);
    mount.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      mount.removeEventListener("click", onClick);
      mount.removeChild(renderer.domElement);
      scene.remove(...nodes, ...labels);
      edges.forEach((edge) => {
        scene.remove(edge.line, edge.label);
      });
      nodeMaterial.dispose();
    };
  }, [getPdf, pdfEdges, pdfNodes, selectEdge]);

  return (
    <StyledWrapper>
      <StyledCanvas
        ref={mountRef}
        visibility={loading ? "hidden" : "visible"}
      />
      {loading && (
        <StyledLoading>
          <Loading />
        </StyledLoading>
      )}
    </StyledWrapper>
  );
};

export default ThreeScene;

const StyledWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledCanvas = styled.div<{ visibility: string }>`
  width: 100%;
  height: 600px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  visibility: ${({ visibility }) => (visibility ? visibility : "visible")};
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
