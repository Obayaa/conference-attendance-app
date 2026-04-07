import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { importMembers } from "../utils/supabase";

export default function MemberUpload({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [skippedRows, setSkippedRows] = useState([]);
  const [failedRows, setFailedRows] = useState([]);

  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const normalized = [];
          const skipped = [];

          jsonData.forEach((row, index) => {
            const normalized_row = Object.fromEntries(
              Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v]),
            );

            const custid =
              normalized_row.custid ||
              normalized_row["customer id"] ||
              normalized_row["cust id"] ||
              normalized_row.id;

            if (!custid) {
              skipped.push(index + 2); // +2 because row 1 is header
              return;
            }

            const name = normalized_row.name || normalized_row["full name"];
            const phone =
              normalized_row.phone ||
              normalized_row["phone number"] ||
              normalized_row["phone no"];
            const branch = normalized_row.branch;
            const gender = normalized_row.gender;

            normalized.push({
              custid: String(custid).trim(),
              name: name ? String(name).trim() : "",
              phone: phone ? String(phone).trim() : "",
              branch: branch ? String(branch).trim() : "",
              gender: gender ? String(gender).trim() : "",
            });
          });

          normalized._skipped = skipped;
          resolve(normalized);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError("");
    setSuccess("");
    setSkippedRows([]);
    setFailedRows([]);
    setFile(selectedFile);

    try {
      const data = await parseFile(selectedFile);
      const skipped = data._skipped || [];
      setPreview(data.slice(0, 5)); // show first 5 rows in preview
      if (skipped.length > 0) {
        setSkippedRows(skipped);
      }
    } catch (err) {
      setError("Failed to read file: " + err.message);
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setSuccess("");
    setFailedRows([]);

    try {
      // Re-parse to get fresh data + skipped rows
      const data = await parseFile(file);
      const skipped = data._skipped || [];
      setSkippedRows(skipped); // keep skipped rows in sync

      const result = await importMembers(data);
      console.log("Import result:", result);

      if (result.success) {
        const parts = [];
        if (result.newCount > 0) parts.push(`${result.newCount} new`);
        if (result.updatedCount > 0)
          parts.push(`${result.updatedCount} updated`);
        if (result.duplicateCount > 0)
          parts.push(
            `${result.duplicateCount} duplicate${result.duplicateCount > 1 ? "s" : ""} in file skipped`,
          );
        if (result.failedCount > 0) parts.push(`${result.failedCount} failed`);

        setSuccess(
          `Import complete: ${parts.length > 0 ? `:  ${parts.join(", ")}.` : " No changes made."}`,
        );
        setFailedRows(result.failedRows || []);

        // Only auto-close if everything was completely clean
        if (result.failedCount === 0 && skipped.length === 0) {
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 5000);
        }
      } else {
        setError(result.error || "Failed to import members");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadFailed = () => {
    const ws = XLSX.utils.json_to_sheet(failedRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Failed Rows");
    XLSX.writeFile(wb, "failed_import_rows.xlsx");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">Upload Members</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              File Format Requirements:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>File must be in Excel (.xlsx, .xls) or CSV format</li>
              <li>
                Required columns:{" "}
                <strong>custid, name, phone, branch, gender</strong>
              </li>
              <li>Column names are case-insensitive</li>
              <li>All fields are required for each member</li>
              <li>Duplicate custid values will be updated with new data</li>
            </ul>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  file
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-indigo-400 bg-gray-50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mx-auto mb-3 ${
                    file ? "text-green-600" : "text-gray-400"
                  }`}
                />
                {file ? (
                  <div>
                    <p className="text-green-700 font-semibold">{file.name}</p>
                    <p className="text-sm text-green-600 mt-1">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 font-semibold">
                      Click to select file
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Excel (.xlsx, .xls) or CSV
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Preview (first 10 rows):
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">
                        CustID
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Phone
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Branch
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Gender
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-4 py-2">{row.custid}</td>
                        <td className="px-4 py-2">{row.name}</td>
                        <td className="px-4 py-2">{row.phone}</td>
                        <td className="px-4 py-2">{row.branch}</td>
                        <td className="px-4 py-2">{row.gender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Failed rows — shown after upload */}
          {failedRows.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-semibold">
                      {failedRows.length} row{failedRows.length > 1 ? "s" : ""}{" "}
                      failed to import
                    </p>
                    <p className="text-red-700 text-sm mt-1">
                      Download the file to see which rows failed and why.
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadFailed}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Failed Rows
                </button>
              </div>
            </div>
          )}

          {/* Skipped rows — shown after file select */}
          {skippedRows.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-semibold">
                    {skippedRows.length} row{skippedRows.length > 1 ? "s" : ""}{" "}
                    skipped — missing Customer ID
                  </p>
                  <p className="text-amber-700 text-sm mt-1">
                    Fix these rows in your Excel file and re-upload if needed.
                  </p>
                </div>
              </div>
              <div className="bg-white border border-amber-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Row numbers: </span>
                  {skippedRows.join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              {success ? "Close" : "Cancel"}
            </button>
            {!success && (
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import Members
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
