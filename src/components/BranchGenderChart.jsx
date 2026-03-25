import React, { useState } from "react";

export default function BranchGenderChart({ branchGenderBreakdown }) {
  const [isStacked, setIsStacked] = useState(false);

  if (
    !branchGenderBreakdown ||
    Object.keys(branchGenderBreakdown).length === 0
  ) {
    return (
      <div className="p-8 text-center text-gray-500">No data available</div>
    );
  }

  const branches = Object.entries(branchGenderBreakdown).sort((a, b) => {
    const totalA = Object.values(a[1]).reduce((sum, val) => sum + val, 0);
    const totalB = Object.values(b[1]).reduce((sum, val) => sum + val, 0);
    return totalB - totalA;
  });

  const maxSingle = Math.max(
    ...branches.map(([_, d]) => Math.max(d.Male || 0, d.Female || 0)),
  );
  const maxStacked = Math.max(
    ...branches.map(([_, d]) => (d.Male || 0) + (d.Female || 0)),
  );
  const currentMax = isStacked ? maxStacked : maxSingle;
  const yAxisMax = currentMax <= 5 ? 5 : Math.ceil(currentMax / 5) * 5;
  const yAxisSteps = 5;

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Header Toggle */}
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-lg font-bold text-gray-800">
          Branch Gender Distribution
        </h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setIsStacked(false)}
            className={`px-3 py-1 text-xs font-bold rounded-md ${!isStacked ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setIsStacked(true)}
            className={`px-3 py-1 text-xs font-bold rounded-md ${isStacked ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}
          >
            Stacked
          </button>
        </div>
      </div>

      <div className="relative h-[320px] w-full">
        {/* 1. Y-Axis & Grid Lines */}
        <div className="absolute inset-0 left-10 bottom-12">
          {[...Array(yAxisSteps + 1)].map((_, i) => {
            const topPos = (i / yAxisSteps) * 100;
            return (
              <React.Fragment key={i}>
                <div
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: `${topPos}%` }}
                />
                <div
                  className="absolute -left-10 text-[10px] font-bold text-gray-400 w-8 text-right"
                  style={{ top: `${topPos}%`, transform: "translateY(-50%)" }}
                >
                  {Math.round(yAxisMax - i * (yAxisMax / yAxisSteps))}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* 2. THE FIX: Absolute X-Axis Line */}
        {/* This line is placed exactly at the bottom of the bars */}
        <div className="absolute left-10 right-0 bottom-12 h-[2px] bg-gray-300 z-10" />

        {/* 3. Bars Container */}
        {/* We set bottom-12 to match the height of the labels below */}
        <div className="absolute left-10 right-0 top-0 bottom-12 flex items-stretch justify-around px-2">
          {branches.map(([branch, data]) => {
            const m = data.Male || 0;
            const f = data.Female || 0;
            const total = m + f;

            return (
              <div
                key={branch}
                className="flex-1 flex flex-col items-center group max-w-[100px] relative"
              >
                {/* Bars - No padding or margin at the bottom */}
                <div className="relative flex-1 w-full flex items-end justify-center gap-1">
                  {isStacked ? (
                    <div
                      className="w-10 flex flex-col-reverse shadow-sm transition-all duration-500"
                      style={{ height: `${(total / yAxisMax) * 100}%` }}
                    >
                      <div
                        className="w-full bg-blue-500 rounded-b-[1px]"
                        style={{ height: `${(m / total) * 100}%` }}
                      />
                      <div
                        className="w-full bg-pink-500 rounded-t-sm border-b border-white/10"
                        style={{ height: `${(f / total) * 100}%` }}
                      />
                    </div>
                  ) : (
                    <>
                      <div
                        className="w-5 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm shadow-sm relative transition-all duration-500"
                        style={{ height: `${(m / yAxisMax) * 100}%` }}
                      >
                        {m > 0 && (
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600">
                            {m}
                          </span>
                        )}
                      </div>
                      <div
                        className="w-5 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-sm shadow-sm relative transition-all duration-500"
                        style={{ height: `${(f / yAxisMax) * 100}%` }}
                      >
                        {f > 0 && (
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-pink-600">
                            {f}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Labels Container */}
        <div className="absolute left-10 right-0 bottom-0 h-12 flex items-stretch justify-around px-2">
          {branches.map(([branch, data]) => (
            <div
              key={branch}
              className="flex-1 flex flex-col items-center pt-2 max-w-[100px]"
            >
              <span className="text-[11px] font-bold text-gray-700 truncate w-full text-center">
                {branch}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                ({(data.Male || 0) + (data.Female || 0)})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Male
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Female
          </span>
        </div>
      </div>
    </div>
  );
}
