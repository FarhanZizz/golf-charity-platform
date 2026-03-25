import React, { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useScores } from "../../hooks/useScores";
import { getScoreColor, getScoreLabel, formatDate } from "../../lib/utils";

export default function ScoreEntry() {
  const { scores, loading, addScore, updateScore, deleteScore } = useScores();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ score: "", date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ score: "", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setForm({ score: s.score, date: s.played_at });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = Number(form.score);
    if (v < 1 || v > 45) return;
    setSaving(true);
    let ok;
    if (editId) {
      ok = await updateScore(editId, v, form.date);
    } else {
      ok = await addScore(v, form.date);
    }
    setSaving(false);
    if (ok) resetForm();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl text-cream">Your Scores</h3>
          <p className="text-cream/40 text-xs mt-0.5">Last 5 Stableford scores · most recent first</p>
        </div>
        {scores.length < 5 && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-4">
            <Plus size={15} /> Add score
          </button>
        )}
      </div>

      {/* Score balls */}
      {loading ? (
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-12 h-12 rounded-full bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : scores.length === 0 ? (
        <div className="text-center py-8 text-cream/30">
          <p className="text-sm">No scores yet. Add your first score to enter draws.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {scores.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-colors group"
            >
              <div className={`score-ball ${getScoreColor(s.score)} bg-transparent text-sm shrink-0`}>
                {s.score}
              </div>
              <div className="flex-1">
                <p className="text-cream text-sm font-medium">{getScoreLabel(s.score)}</p>
                <p className="text-cream/40 text-xs">{formatDate(s.played_at)}</p>
              </div>
              {i === 0 && (
                <span className="badge-green text-xs">Latest</span>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(s)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-cream/40 hover:text-cream transition-all"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteScore(s.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-cream/40 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Draw numbers preview */}
      {scores.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-cream/40 text-xs mb-3">Your draw numbers this month</p>
          <div className="flex gap-2 flex-wrap">
            {scores.map((s) => (
              <div
                key={s.id}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-sm font-bold ${getScoreColor(s.score)}`}
              >
                {s.score}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <p className="text-cream/60 text-sm font-medium">{editId ? "Edit score" : "Add score"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stableford score</label>
              <input
                type="number"
                min={1}
                max={45}
                value={form.score}
                onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
                placeholder="1–45"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Date played</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4 flex-1 justify-center">
              {saving ? (
                <span className="w-4 h-4 border-2 border-forest/40 border-t-forest rounded-full animate-spin" />
              ) : (
                <><Check size={15} /> {editId ? "Save" : "Add"}</>
              )}
            </button>
            <button type="button" onClick={resetForm} className="btn-ghost text-sm px-3">
              <X size={15} /> Cancel
            </button>
          </div>
        </form>
      )}

      {scores.length === 5 && !showForm && (
        <p className="text-cream/30 text-xs mt-4 text-center">
          Maximum 5 scores reached. Adding a new one will replace the oldest.
        </p>
      )}
    </div>
  );
}
