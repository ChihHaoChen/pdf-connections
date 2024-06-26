
This project demonstrates rendering PDF files and their connections using Three.js within a [Next.js](https://nextjs.org/) application bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed. 
Since this project is based on Next.js 14, so please download it (higher than v21) from [nodejs.org](https://nodejs.org/en/download/package-manager) based on your OS.

### Installation

Clone the repository and install the dependencies:


First, run the development server:
```
git clone https://github.com/ChihHaoChen/pdf-connections
cd your-project
npm install
# or
pnpm i
```

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

1. Frameworks & Libraries: React.js-based Next.js framework is employed for the frontend development with typescript. One advantage of using typescript is to know the available functions or objects in Three.js. Regarding rendering PDF files, the package pdfjs-dist is used to add rendered PDF files close to the nodes. Moreover, since PDF files is an async operation, so a loading indicator gets rendered until PDF files get rendered on canvas. As for styles, styled-components is used.
2. Data Handling: since creating a DB for this small project is not required, so a sample data has been set up as 
    
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
    
    The unique id, file name, and file paths are directly set up in the object format for the nodes and edges for demonstrating the desired features while usually such data uniqueness should be configured in backend.  In this application, since only edges are editable, state variable has been configured in the top view to store the changes after editing edges. No further editing regarding the sample data is employed since that is not required for this application.
    
3. Editing edges: an onClick function with  the function intersectObjects from Three.Raycaster is implemented. Since only editing one edge per operation, only the first intersected edge is configured as the argument for the useCallback hook - selectEdge for updating  and saving the value of the selected edge. An table with a input box has been placed under the canvas view. When edges are selected, the table will be rendered, while in the case of no selected edges, an empty icon with message will show up to inform users about no selected edges. Please notice as mentioned beforehand, here saving operation only involves updating the values in the state variable without editing the sample data.
4. 3D interaction: a class inside the Three addons folder has been used to handle rotation, zoom, and pan operations on canvas for navigating the graph.

