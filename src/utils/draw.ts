import * as THREE from "three";
import { DataNode } from "@/data/pdfData";

export type Edge = {
  line: THREE.LineSegments;
  label: THREE.Sprite;
  text: string;
  id: number;
};

export const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x008080 });

export function createNode(data: DataNode): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(0.2, 32, 32);
  const node = new THREE.Mesh(geometry, nodeMaterial);
  node.position.set(data.x, data.y, data.z);
  // Attach ID and name as a custom property
  (node as THREE.Mesh).userData.id = data.id;
  (node as THREE.Mesh).userData.name = data.name;

  return node;
}

export function createLabel(text: number | string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not get 2D context");
  }
  context.font = "48px Arial";
  context.fillStyle = "#FFA200";
  context.fillText(text.toString(), 0, 48);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1, 1, 1);
  return sprite;
}

export function createEdge(
  nodeSource: THREE.Mesh,
  nodeTarget: THREE.Mesh,
  text: string = "",
  id: number
) {
  const material = new THREE.LineBasicMaterial({
    color: 0xff6e1e,
    linewidth: 2,
  });
  const points = [];
  points.push(
    new THREE.Vector3(
      nodeSource.position.x,
      nodeSource.position.y,
      nodeSource.position.z
    )
  );
  points.push(
    new THREE.Vector3(
      nodeTarget.position.x,
      nodeTarget.position.y,
      nodeTarget.position.z
    )
  );
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineSegments(geometry, material);

  const midPoint = new THREE.Vector3(
    (nodeSource.position.x + nodeTarget.position.x) / 2,
    (nodeSource.position.y + nodeTarget.position.y) / 2,
    (nodeSource.position.z + nodeTarget.position.z) / 2
  );
  const label = createLabel(text);
  label.position.set(midPoint.x, midPoint.y, midPoint.z);

  return {
    line,
    label,
    text,
    id,
  };
}

export function updateLabels(
  labels: THREE.Sprite[],
  nodes: THREE.Mesh[],
  edges: Edge[]
) {
  nodes.length &&
    labels.forEach((label, index) => {
      const node = nodes[index];
      node &&
        label.position.set(
          node.position.x,
          node.position.y + 0.3,
          node.position.z
        );
    });

  edges.forEach((edge) => {
    const positions = edge.line.geometry.attributes.position
      .array as Float32Array;
    const midPoint = new THREE.Vector3(
      (positions[0] + positions[3]) / 2,
      (positions[1] + positions[4]) / 2,
      (positions[2] + positions[5]) / 2
    );
    edge.label.position.set(midPoint.x, midPoint.y, midPoint.z);
  });
}
