import type { Node, Edge } from "@xyflow/react";

interface CustomNodeData {
  HFdataset?: string | null;
  basemodel?: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

interface ClusterType {
  getNodes: () => Node<CustomNodeData>[];
  getEdges: () => Edge[];
}

interface ReqData {
  clusterID: string;
  datasets: (string | null)[];
  basemodel: string | null;
}

const clusterToData = (cluster: ClusterType) => {
  const nodes = cluster.getNodes().map((node) => ({
    id: node.id,
    type: node.type,
    data: node.data,
    position: node.position,
  }));
  const edges = cluster.getEdges().map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    animated: edge.animated,
    style: edge.style,
    type: edge.type,
  }));
  return { nodes, edges };
};

const clusterToJSON = (cluster: ClusterType) => {
  const data = clusterToData(cluster);
  const reqData: ReqData = { clusterID: "", datasets: [], basemodel: "" };

  const datasets = data.nodes.filter((node) => node.type === "dataset");
  const basemodels = data.nodes.filter((node) => node.type === "basemodel");

  for (let i = 0; i < datasets.length; i++) {
    reqData["datasets"].push(datasets[i]?.data?.HFdataset || null);
  }

  reqData["basemodel"] = basemodels[0]?.data?.basemodel || null;

  //current Time is the clusterID with format DDMMYYYYHHMMSS
  const now = new Date();
  const clusterID =
    now.getDate().toString().padStart(2, "0") +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getFullYear().toString() +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");

  reqData["clusterID"] = clusterID;
  console.log(reqData);

  return JSON.stringify(reqData, null, 2);
};

export default clusterToJSON;
