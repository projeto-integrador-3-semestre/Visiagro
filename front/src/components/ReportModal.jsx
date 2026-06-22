import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

const C = {
    bg: "var(--bg)",
    bgCard: "var(--bg-card)",
    bgLight: "var(--bg-light)",
    border: "var(--border)",
    borderLight: "var(--border-light)",
    green: "var(--green)",
    greenLime: "var(--green-lime)",
    greenGlow: "var(--green-glow)",
    text: "var(--text)",
    textSub: "var(--text-sub)",
    textDim: "var(--text-dim)",
    danger: "var(--danger)",
    warn: "var(--warn)",
    accentText: "var(--accent-text)",
};

const Field = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{
            display: "block",
            fontSize: 12,
            color: C.textDim,
            marginBottom: 5,
            fontWeight: 700,
            letterSpacing: 0.5,
            fontFamily: "'Manrope', sans-serif",
        }}>
            {label.toUpperCase()}
        </label>
        {children}
    </div>
);

export default function ReportModal({ predictionId, pest, confidence, onClose }) {
    const inp = {
        background: C.bgLight,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "11px 14px",
        color: C.text,
        fontSize: 14,
        width: "100%",
        fontFamily: "'Manrope', sans-serif",
        outline: "none",
    };

    const [form, setForm] = useState({
        produto_recomendado: "",
        ingrediente_ativo: "",
        dose: "",
        unidade_dose: "L/ha",
        volume_calda: "",
        modo_aplicacao: "",
        prescricao: "",
        observacoes: "",
        responsavel_tecnico: "",
        crea: "",
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!predictionId) return;
        (async () => {
            setLoading(true);
            const { data: session } = await supabase.auth.getSession();
            const token = session.session?.access_token;
            if (!token) { setLoading(false); return; }
            try {
                const res = await fetch(`${API_BASE_URL}/reports/${predictionId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.id) setForm(f => ({ ...f, ...data }));
                }
            } catch { }
            setLoading(false);
        })();
    }, [predictionId]);

    const set = (field) => (e) => {
        setSaved(false);
        setForm(f => ({ ...f, [field]: e.target.value }));
    };

    const handleSave = async () => {
        setSaving(true); setError(""); setSaved(false);
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        if (!token) { setError("Sessão expirada."); setSaving(false); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/reports/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    prediction_id: predictionId,
                    dose: form.dose ? Number(form.dose) : null,
                }),
            });
            if (!res.ok) throw new Error("Erro ao salvar.");
            setSaved(true);
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    };

    const handlePdf = () => {
        const risco = pest?.nivel_risco || "Não informado";
        const conf = confidence != null ? `${Math.round(confidence * 100)}%` : "—";
        const dataHoje = new Date().toLocaleDateString("pt-BR");

        const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8"/>
      <title>Relatório Técnico - ${pest?.nome_comum || "Praga"}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
        h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        h2 { font-size: 14px; font-weight: 700; margin: 18px 0 8px; color: #1a5c22; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        .subtitle { color: #555; font-size: 12px; margin-bottom: 18px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #1a5c22; padding-bottom: 14px; }
        .header-title { }
        .header-meta { text-align: right; font-size: 12px; color: #555; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; background: #f9fdf7; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field { margin-bottom: 10px; }
        .field label { display: block; font-size: 11px; font-weight: 700; color: #555; margin-bottom: 3px; letter-spacing: 0.4px; text-transform: uppercase; }
        .field p { font-size: 13px; color: #111; line-height: 1.5; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #fff; }
        .badge-alto { background: #e53e3e; }
        .badge-medio { background: #d97706; }
        .badge-baixo { background: #2f7d32; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 14px; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
        .assinatura { margin-top: 48px; border-top: 1px solid #555; padding-top: 8px; width: 260px; font-size: 12px; color: #333; text-align: center; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-title">
          <h1>Relatório Técnico de Pragas</h1>
          <p class="subtitle">VisiAgro — Diagnóstico Agrícola</p>
        </div>
        <div class="header-meta">
          <p>Data: ${dataHoje}</p>
          <p>ID análise: ${predictionId || "—"}</p>
        </div>
      </div>

      <h2>Dados da Detecção</h2>
      <div class="card">
        <div class="grid2">
          <div class="field">
            <label>Praga identificada</label>
            <p><strong>${pest?.nome_comum || "—"}</strong></p>
          </div>
          <div class="field">
            <label>Nome científico</label>
            <p><em>${pest?.nome_cientifico || "—"}</em></p>
          </div>
          <div class="field">
            <label>Nível de risco</label>
            <p>${risco}</p>
          </div>
          <div class="field">
            <label>Confiança da detecção</label>
            <p>${conf}</p>
          </div>
        </div>
        ${pest?.danos_causados ? `
        <div class="field" style="margin-top:10px">
          <label>Danos causados</label>
          <p>${pest.danos_causados}</p>
        </div>` : ""}
        ${pest?.acoes_recomendadas ? `
        <div class="field" style="margin-top:6px">
          <label>Ações recomendadas</label>
          <p>${pest.acoes_recomendadas}</p>
        </div>` : ""}
      </div>

      <h2>Prescrição do Agrônomo</h2>
      <div class="card">
        <div class="grid2">
          <div class="field">
            <label>Produto recomendado</label>
            <p>${form.produto_recomendado || "—"}</p>
          </div>
          <div class="field">
            <label>Ingrediente ativo</label>
            <p>${form.ingrediente_ativo || "—"}</p>
          </div>
          <div class="field">
            <label>Dose</label>
            <p>${form.dose ? `${form.dose} ${form.unidade_dose}` : "—"}</p>
          </div>
          <div class="field">
            <label>Volume de calda</label>
            <p>${form.volume_calda || "—"}</p>
          </div>
        </div>
        <div class="field" style="margin-top:6px">
          <label>Modo de aplicação</label>
          <p>${form.modo_aplicacao || "—"}</p>
        </div>
        ${form.prescricao ? `
        <div class="field" style="margin-top:6px">
          <label>Prescrição</label>
          <p>${form.prescricao}</p>
        </div>` : ""}
        ${form.observacoes ? `
        <div class="field" style="margin-top:6px">
          <label>Observações técnicas</label>
          <p>${form.observacoes}</p>
        </div>` : ""}
      </div>

      <h2>Responsável Técnico</h2>
      <div class="card">
        <div class="grid2">
          <div class="field">
            <label>Nome</label>
            <p>${form.responsavel_tecnico || "—"}</p>
          </div>
          <div class="field">
            <label>CREA</label>
            <p>${form.crea || "—"}</p>
          </div>
        </div>
      </div>

      <div style="margin-top: 32px;">
        <div class="assinatura">
          <p>${form.responsavel_tecnico || "Responsável Técnico"}</p>
          <p style="font-size:11px;color:#888">${form.crea ? `CREA: ${form.crea}` : ""}</p>
        </div>
      </div>

      <div class="footer">
        <span>VisiAgro — Relatório gerado em ${dataHoje}</span>
        <span>Documento gerado automaticamente pelo sistema</span>
      </div>
    </body>
    </html>
  `;

        const janela = window.open("", "_blank", "width=800,height=900");
        janela.document.write(html);
        janela.document.close();
        janela.focus();
        setTimeout(() => janela.print(), 400);
    };


    const riskColor = (r = "") => {
        const v = r.toLowerCase();
        if (v.includes("alto") || v === "red") return "var(--danger)";
        if (v.includes("medio") || v.includes("médio") || v === "yellow") return "var(--warn)";
        return "var(--orange)";
    };

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
            padding: "20px 16px 40px",
        }}>
            <div style={{
                width: "100%",
                maxWidth: 580,
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: "24px 22px",
                position: "relative",
                fontFamily: "'Manrope', sans-serif",
            }}>

                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                }}>
                    <h2 style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: C.text,
                    }}>
                        Relatório Técnico
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            color: C.textDim,
                            fontSize: 24,
                            lineHeight: 1,
                            padding: "4px 8px",
                            borderRadius: 8,
                            background: C.bgLight,
                            border: `1px solid ${C.border}`,
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Dados da detecção */}
                <div style={{
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    marginBottom: 20,
                }}>
                    <p style={{ fontSize: 11, color: C.textDim, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>
                        DETECÇÃO
                    </p>
                    <p style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
                        {pest?.nome_comum || "—"}
                    </p>
                    {pest?.nome_cientifico && (
                        <p style={{ fontSize: 13, color: C.textSub, fontStyle: "italic", marginTop: 2 }}>
                            {pest.nome_cientifico}
                        </p>
                    )}
                    <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 13, color: C.textSub, flexWrap: "wrap" }}>
                        {pest?.nivel_risco && (
                            <span>
                                Risco:{" "}
                                <span style={{
                                    background: riskColor(pest.nivel_risco),
                                    color: "#fff",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: "2px 9px",
                                    borderRadius: 20,
                                }}>
                                    {pest.nivel_risco}
                                </span>
                            </span>
                        )}
                        <span>
                            Confiança:{" "}
                            <b style={{ color: C.green }}>
                                {confidence != null ? `${Math.round(confidence * 100)}%` : "—"}
                            </b>
                        </span>
                    </div>
                    {pest?.danos_causados && (
                        <p style={{ fontSize: 12, color: C.textDim, marginTop: 10, lineHeight: 1.5 }}>
                            {pest.danos_causados}
                        </p>
                    )}
                    {pest?.acoes_recomendadas && (
                        <p style={{ fontSize: 12, color: C.textDim, marginTop: 4, lineHeight: 1.5 }}>
                            {pest.acoes_recomendadas}
                        </p>
                    )}
                </div>

                {loading ? (
                    <p style={{ color: C.textSub, textAlign: "center", padding: 24 }}>
                        Carregando...
                    </p>
                ) : (
                    <>
                        <p style={{ fontSize: 11, color: C.textDim, fontWeight: 700, marginBottom: 16, letterSpacing: 0.5 }}>
                            PRESCRIÇÃO DO AGRÔNOMO
                        </p>

                        <Field label="Produto recomendado">
                            <input style={inp} value={form.produto_recomendado} onChange={set("produto_recomendado")} placeholder="Ex: Dipel WP" />
                        </Field>

                        <Field label="Ingrediente ativo">
                            <input style={inp} value={form.ingrediente_ativo} onChange={set("ingrediente_ativo")} placeholder="Ex: Bacillus thuringiensis" />
                        </Field>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <Field label="Dose">
                                <input style={inp} type="number" value={form.dose} onChange={set("dose")} placeholder="0.0" />
                            </Field>
                            <Field label="Unidade">
                                <select style={{ ...inp, cursor: "pointer" }} value={form.unidade_dose} onChange={set("unidade_dose")}>
                                    {["L/ha", "kg/ha", "mL/100L", "g/100L", "L/100L"].map(u => (
                                        <option key={u} value={u} style={{ background: "var(--bg-card)" }}>{u}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field label="Volume de calda">
                            <input style={inp} value={form.volume_calda} onChange={set("volume_calda")} placeholder="Ex: 200 L/ha" />
                        </Field>

                        <Field label="Modo de aplicação">
                            <input style={inp} value={form.modo_aplicacao} onChange={set("modo_aplicacao")} placeholder="Ex: Pulverização foliar" />
                        </Field>

                        <Field label="Prescrição">
                            <textarea
                                style={{ ...inp, minHeight: 80, resize: "vertical" }}
                                value={form.prescricao}
                                onChange={set("prescricao")}
                                placeholder="Descrição detalhada da prescrição..."
                            />
                        </Field>

                        <Field label="Observações técnicas">
                            <textarea
                                style={{ ...inp, minHeight: 60, resize: "vertical" }}
                                value={form.observacoes}
                                onChange={set("observacoes")}
                                placeholder="Observações adicionais..."
                            />
                        </Field>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <Field label="Responsável técnico">
                                <input style={inp} value={form.responsavel_tecnico} onChange={set("responsavel_tecnico")} placeholder="Nome completo" />
                            </Field>
                            <Field label="CREA">
                                <input style={inp} value={form.crea} onChange={set("crea")} placeholder="CREA-XX 000000" />
                            </Field>
                        </div>

                        {error && (
                            <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>
                        )}
                        {saved && (
                            <p style={{ color: C.green, fontSize: 13, marginBottom: 12 }}>✓ Salvo com sucesso.</p>
                        )}

                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    flex: 1,
                                    padding: "14px",
                                    borderRadius: 12,
                                    fontWeight: 700,
                                    fontSize: 14,
                                    background: `linear-gradient(135deg, ${C.green}, ${C.greenLime})`,
                                    color: C.accentText,
                                    border: "none",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    opacity: saving ? 0.7 : 1,
                                    fontFamily: "'Manrope', sans-serif",
                                }}
                            >
                                {saving ? "Salvando..." : "Salvar relatório"}
                            </button>
                            <button
                                onClick={handlePdf}
                                style={{
                                    padding: "14px 18px",
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    background: C.bgCard,
                                    border: `1px solid ${C.border}`,
                                    color: C.text,
                                    cursor: "pointer",
                                    fontFamily: "'Manrope', sans-serif",
                                }}
                            >
                                PDF
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}