
This project demonstrates rendering PDF files and their connections using Three.js within a [Next.js](https://nextjs.org/) application bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed. 
Since this project is based on Next.js 14, so please download it (higher than v21) from [nodejs.org](https://nodejs.org/en/download/package-manager) based on your OS.

### Installation and Running the Development Server

Clone the repository and install the dependencies:

```
git clone https://github.com/ChihHaoChen/pdf-connections
cd your-project
npm install
# or
pnpm i
```
Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### Deployed URL

Please refer to the URL [https://pdf-connections.vercel.app](https://pdf-connections.vercel.app) for this application.


## Project Structure
- `public/`: Contains static files like PDF files, `pdf.worker.js` and `pdf.worker.js.map`.
- `src/components`: include the header, table, loading indicator, and scene component to sets up the Three.js scene, loads PDFs, and manages node connections.
- `src/utils/`: Utility functions for creating nodes, edges, and labels.
- `src/data/pdfData.ts`: Contains data structures and mock data for nodes and edges.
- `src/app/`: Main folder for Next.js application files and routes. This is where we define the pages and layout of your application.

## Technical Details

1. Frameworks & Libraries: 
- Next.js: Used for frontend development with TypeScript. TypeScript helps identify available functions or objects in Three.js.
- pdfjs-dist: Used to render PDF files close to the nodes. Since rendering PDF files is an async operation, a loading indicator is shown until the PDFs are rendered on the canvas.
- styled-components: Used for styling.
2. Data Handling: 
- A sample data setup is used instead of creating a database for this small project:
    
    ```
    {
      nodes: [
        { id: 1, name: "File1.pdf", path: "/File1.pdf", x: -2, y: 0, z: 0 },
        { id: 2, name: "File2.pdf", path: "/File2.pdf", x: 0, y: 2, z: 0 },
        { id: 3, name: "File3.pdf", path: "/File3.pdf", x: 2, y: -2, z: 2 },
      ],
      edges: [
        { id: 1, source: 1, target: 2, value: "related" },
        { id: 2, source: 2, target: 3, value: "cites" },
        { id: 3, source: 1, target: 3, value: "" },
      ],
    };
    ```
    
- Unique IDs, file names, and file paths are set up in the object format for nodes and edges to demonstrate desired features. Usually, such data uniqueness should be configured in the backend. Only edges are editable, and state variables are used to store changes after editing edges. No further editing of the sample data is employed since it is not required for this application.
    
3. Editing edges: 
- An onClick function with the function intersectObjects from Three.Raycaster is implemented. Since only one edge is edited per operation, only the first intersected edge is passed as the argument to the useCallback hook - selectEdge for updating and saving the selected edge's value.
- A table with an input box is placed under the canvas view. When edges are selected, the table is rendered; if no edges are selected, an empty icon with a message informs users about no selected edges. The saving operation only involves updating values in the state variable without editing the sample data.
4. 3D interaction: 
- A class from the Three.js addons folder handles rotation, zoom, and pan operations on the canvas for navigating the graph.

