import axios from "axios";
import React, { FC, useEffect, useState } from "react";

export type Asset = {
  assetType: string;
  assetName: string;
  quantity: string;
  purchasePrice: string;
  purchaseDate: string;
};

type AssetTableProps = {
  onEdit: (asset: Asset) => void;
};

const tableUrl: string = "http://localhost:8080/api/v1/asset/user";

const AssetTable: FC<AssetTableProps> = ({ onEdit }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const Messages = {
    ERROR: "Failed to fetch assets.",
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    axios
      .get<Asset[]>(tableUrl, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setAssets(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch asset data ", error);
        setErrorMessage(Messages.ERROR);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div style={{ overflowX: "auto" }}>
      {loading && <p>Loading...</p>}
      {errorMessage && <p className="text-danger text-bold">{errorMessage}</p>}

      <table
        className="table table-bordered table-hover bg-dark text-white"
        style={{ margin: "0 auto", maxWidth: "100%", width: "900px" }}
      >
        <thead className="table-dark">
          <tr>
            <th>Asset Type</th>
            <th>Asset Name</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Purchase Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="table-dark">
          {assets.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">
                No assets found!
              </td>
            </tr>
          ) : (
            assets.map((asset) => (
              <tr className="bg-dark" key={asset.assetName}>
                <td>{asset.assetType}</td>
                <td>{asset.assetName}</td>
                <td>{asset.quantity}</td>
                <td>{asset.purchasePrice}</td>
                <td>{asset.purchaseDate}</td>
                <td className="px-0 text-center">
                  <button
                    className="btn m-1 p-1 btn-secondary"
                    onClick={() => onEdit(asset)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
