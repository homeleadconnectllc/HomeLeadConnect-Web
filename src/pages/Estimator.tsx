import { useMemo, useState } from "react";
import {
  calculateEstimate,
  formatCurrency,
  type EstimateLine,
} from "../lib/estimator/calculations";

const initialLines: EstimateLine[] = [
  {
    id: "line-1",
    description: "Labor",
    quantity: 1,
    unitCost: 0,
  },
  {
    id: "line-2",
    description: "Materials",
    quantity: 1,
    unitCost: 0,
  },
];

export default function Estimator() {
  const [lines, setLines] = useState<EstimateLine[]>(initialLines);
  const [markupPercent, setMarkupPercent] = useState(20);

  const summary = useMemo(
    () => calculateEstimate(lines, markupPercent),
    [lines, markupPercent],
  );

  function updateLine(
    id: string,
    field: "description" | "quantity" | "unitCost",
    value: string,
  ) {
    setLines((current) =>
      current.map((line) => {
        if (line.id !== id) return line;

        if (field === "description") {
          return { ...line, description: value };
        }

        const numericValue = Number(value);

        return {
          ...line,
          [field]: Number.isFinite(numericValue)
            ? Math.max(0, numericValue)
            : 0,
        };
      }),
    );
  }

  function addLine() {
    setLines((current) => [
      ...current,
      {
        id: `line-${Date.now()}`,
        description: "",
        quantity: 1,
        unitCost: 0,
      },
    ]);
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "48px 24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "min(1100px, 100%)",
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: 32 }}>
          <p
            style={{
              margin: 0,
              color: "#2563eb",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              fontSize: 13,
            }}
          >
            HomeLead Connect
          </p>

          <h1
            style={{
              margin: "8px 0",
              fontSize: "clamp(36px, 6vw, 64px)",
              letterSpacing: "-2px",
            }}
          >
            Estimator
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 700,
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            Build a project estimate from labor, materials, quantities, and
            markup. Saving estimates to the HLC data layer will be wired after
            the calculation contract is verified.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 320px",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 12px 40px rgba(15,23,42,.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Estimate items</h2>
                <p style={{ color: "#64748b", margin: "6px 0 0" }}>
                  Add the work and materials included in the project.
                </p>
              </div>

              <button type="button" onClick={addLine}>
                Add item
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {lines.map((line) => (
                <div
                  key={line.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) 110px 140px auto",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <input
                    aria-label="Item description"
                    value={line.description}
                    onChange={(event) =>
                      updateLine(
                        line.id,
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Description"
                    style={{ padding: "11px 12px" }}
                  />

                  <input
                    aria-label="Quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(line.id, "quantity", event.target.value)
                    }
                    style={{ padding: "11px 12px" }}
                  />

                  <input
                    aria-label="Unit cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitCost}
                    onChange={(event) =>
                      updateLine(line.id, "unitCost", event.target.value)
                    }
                    placeholder="Unit cost"
                    style={{ padding: "11px 12px" }}
                  />

                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    disabled={lines.length === 1}
                    aria-label={`Remove ${line.description || "item"}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <aside
            style={{
              background: "#111827",
              color: "#fff",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 20px 50px rgba(15,23,42,.18)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Estimate summary</h2>

            <label
              style={{
                display: "grid",
                gap: 8,
                color: "#cbd5e1",
                marginBottom: 24,
              }}
            >
              Markup %
              <input
                type="number"
                min="0"
                step="1"
                value={markupPercent}
                onChange={(event) =>
                  setMarkupPercent(Math.max(0, Number(event.target.value)))
                }
                style={{
                  padding: "11px 12px",
                  borderRadius: 8,
                  border: 0,
                }}
              />
            </label>

            <div style={{ display: "grid", gap: 14 }}>
              <SummaryRow label="Subtotal" value={summary.subtotal} />
              <SummaryRow
                label={`Markup (${markupPercent}%)`}
                value={summary.markupAmount}
              />

              <div
                style={{
                  height: 1,
                  background: "#334155",
                  margin: "4px 0",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                <span>Total</span>
                <span>{formatCurrency(summary.total)}</span>
              </div>
            </div>

            <p
              style={{
                marginBottom: 0,
                marginTop: 24,
                color: "#94a3b8",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Foundation status: calculation engine built. Persistence and
              conversion to a job remain separate wiring gates.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        color: "#cbd5e1",
      }}
    >
      <span>{label}</span>
      <strong style={{ color: "#fff" }}>{formatCurrency(value)}</strong>
    </div>
  );
}
