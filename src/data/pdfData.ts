export const pdfData = {
  nodes: [
    { id: 1, name: "File1.pdf", path: "/path/to/File1.pdf", x: -2, y: 0, z: 0 },
    { id: 2, name: "File2.pdf", path: "/path/to/File2.pdf", x: 0, y: 2, z: 0 },
    { id: 3, name: "File3.pdf", path: "/path/to/File3.pdf", x: 2, y: -2, z: 2 },
  ],
  edges: [
    { id: 1, source: 1, target: 2, value: "related" },
    { id: 2, source: 2, target: 3, value: "cites" },
    { id: 3, source: 1, target: 3, value: "" },
  ],
};

export type DataNode = {
  id: number;
  name: string;
  path: string;
  x: number;
  y: number;
  z: number;
};

export type DataEdge = {
  id: number;
  source: number;
  target: number;
  value: string;
};
