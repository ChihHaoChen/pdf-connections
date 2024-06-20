// components/ThreeScene.tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { pdfData, DataEdge } from "@/data/pdfData";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  createEdge,
  createLabel,
  createNode,
  Edge,
  updateEdgeText,
  updateLabels,
} from "@/utils";

interface NodeData {
  id: number;
  x: number;
  y: number;
  z: number;
}

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  useEffect(() => {
    const mount = mountRef.current!;

    const nodesData = pdfData.nodes;
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Load nodes from JSON
    const nodes: THREE.Mesh[] = [];
    const labels: THREE.Sprite[] = [];
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    nodesData.forEach((nodeData: NodeData) => {
      const node = createNode(nodeData, nodeMaterial, scene);
      const label = createLabel(nodeData.id, scene);
      labels.push(label);
      nodes.push(node);
    });

    // Create edges (lines) connecting the nodes
    const edges: Edge[] = [];

    // Connect nodes with edges

    const dataEdges: DataEdge[] = pdfData.edges;
    dataEdges.forEach((edge) => {
      const sourceNode = nodes.find((node) => node.userData.id === edge.source);
      const targetNode = nodes.find((node) => node.userData.id === edge.target);
      if (sourceNode && targetNode) {
        edges.push(
          createEdge(sourceNode, targetNode, edge.value, edge.id, scene)
        );
      }
    });

    // Position the camera
    camera.position.z = 6;

    // Render loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      updateLabels(labels, nodes, edges);
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
        showInputBox(intersectedEdge);
      }
    }

    function showInputBox(
      edge: THREE.Line<THREE.BufferGeometry, THREE.Material>
    ) {
      const inputBox = document.getElementById("inputBox") as HTMLInputElement;
      const [matchedEdge] = edges.filter((e) => e.line.uuid === edge.uuid);
      const initText = matchedEdge.text;

      inputBox.style.display = "block";
      inputBox.value = initText;
      inputBox.focus();

      inputBox.onblur = () => {
        inputBox.style.display = "none";
        updateEdgeText(edges, edge, inputBox.value, scene);
        inputBox.value = "";
      };
    }

    // Clean up on unmount
    return () => {
      mount.removeChild(renderer.domElement);
      scene.remove(...nodes, ...labels);
      nodeMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "800px" }} />;
};

export default ThreeScene;
