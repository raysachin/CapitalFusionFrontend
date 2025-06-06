import React, { useState } from "react";

import AddAssetModal from "./AddAsset";
import ImportCsvModal from "./ImportCsv";
import AssetTable, { Asset } from "./AssetTable";
import UpdateAssetModal from "./UpdateAsset";

const AssetDataEntry: React.FC = () => {
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showImportCsv, setShowImportCsv] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);

  // Helper: Convert Asset (from AssetTable) to UpdateAssetState shape expected by UpdateAssetModal
  const getUpdateAssetState = (asset: Asset) => ({
    assetType: asset.assetType,
    assetName: asset.assetName,
    quantity: asset.quantity,
    purchasePrice: asset.purchasePrice,
    purchaseDate: asset.purchaseDate,
  });

  return (
    <div className="bg-black">
      <div
        className="bg-black"
        style={{
          maxWidth: 900,
          margin: "auto",
          padding: "1rem",
          color: "white",
        }}
      >
        {/* Buttons aligned right */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
            gap: "1rem",
          }}
        >
          <button
            className="btn btn-primary w-25"
            onClick={() => {
              setShowAddAsset(true);
              setShowImportCsv(false);
              setEditAsset(null);
            }}
          >
            Add Asset
          </button>

          <button
            className="btn btn-primary w-25"
            onClick={() => {
              setShowImportCsv(true);
              setShowAddAsset(false);
              setEditAsset(null);
            }}
          >
            Import CSV
          </button>
        </div>

        {/* Asset Table */}
        <AssetTable
          onEdit={(asset) => {
            setEditAsset(asset);
            setShowAddAsset(false);
            setShowImportCsv(false);
          }}
        />

        {/* Modals */}
        <AddAssetModal show={showAddAsset} onHide={() => setShowAddAsset(false)} />
        <ImportCsvModal show={showImportCsv} onHide={() => setShowImportCsv(false)} />
        <UpdateAssetModal
          show={!!editAsset}
          onHide={() => setEditAsset(null)}
          existingAsset={editAsset ? getUpdateAssetState(editAsset) : undefined}
        />
      </div>
    </div>
  );
};

export default AssetDataEntry;
