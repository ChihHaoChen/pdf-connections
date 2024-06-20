import * as THREE from "three";

interface NodeData {
  id: number;
  x: number;
  y: number;
  z: number;
}

export type Edge = {
  line: THREE.Line;
  label: THREE.Sprite;
  text: string;
  id: number;
};

export function createNode(
  data: NodeData,
  nodeMaterial: THREE.MeshBasicMaterial,
  scene: THREE.Scene
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(0.2, 32, 32);
  const node = new THREE.Mesh(geometry, nodeMaterial);
  node.position.set(data.x, data.y, data.z);
  // Attach ID as a custom property
  (node as THREE.Mesh).userData.id = data.id;
  scene.add(node);
  return node;
}

export function createLabel(
  text: number | string,
  scene: THREE.Scene
): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not get 2D context");
  }
  context.font = "48px Arial";
  context.fillStyle = "rgba(255, 255, 255, 1)";
  context.fillText(text.toString(), 0, 48);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.5, 0.25, 1);
  scene.add(sprite);
  return sprite;
}

export function createEdge(
  node1: THREE.Mesh,
  node2: THREE.Mesh,
  text: string = "",
  id: number,
  scene: THREE.Scene
) {
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const points = [];
  points.push(
    new THREE.Vector3(node1.position.x, node1.position.y, node1.position.z)
  );
  points.push(
    new THREE.Vector3(node2.position.x, node2.position.y, node2.position.z)
  );
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  const midPoint = new THREE.Vector3(
    (node1.position.x + node2.position.x) / 2,
    (node1.position.y + node2.position.y) / 2,
    (node1.position.z + node2.position.z) / 2
  );
  const label = createLabel(text, scene);
  label.position.set(midPoint.x, midPoint.y, midPoint.z);

  return { line, label, text, id };
}

export function updateLabels(
  labels: THREE.Sprite[],
  nodes: THREE.Mesh[],
  edges: Edge[]
) {
  labels.forEach((label, index) => {
    const node = nodes[index];
    label.position.set(node.position.x, node.position.y + 0.3, node.position.z);
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

export function updateEdgeText(
  edges: Edge[],
  edge: THREE.Line<THREE.BufferGeometry, THREE.Material> | undefined,
  text: string,
  scene: THREE.Scene
) {
  const edgeData = edges.find((e) => e.line === edge);
  const edgeId = edgeData?.id;

  if (edgeData) {
    edgeData.text = text;
    scene.remove(edgeData.label);
    edgeData.label = createLabel(text, scene);

    const positions = edge?.geometry.attributes.position.array as Float32Array;
    const midPoint = new THREE.Vector3(
      (positions[0] + positions[3]) / 2,
      (positions[1] + positions[4]) / 2,
      (positions[2] + positions[5]) / 2
    );
    edgeData.label.position.set(midPoint.x, midPoint.y, midPoint.z);

    edge = undefined;
    // update the edge text after this
  }
}
