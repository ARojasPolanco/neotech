import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import api from "../../config/api.js";
import ConfirmModal from "../../components/ConfirmModal.jsx";

const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = ["video/mp4", "video/webm"];

export default function AdminSettings() {
  const fileRef = useRef(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((res) => setSettings(res.data))
      .catch(() => setError("Error al cargar la configuración"))
      .finally(() => setLoading(false));
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setNotice("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato no permitido. Usá MP4 o WebM.");
      return;
    }

    if (file.size > MAX_VIDEO_BYTES) {
      setError("El video supera los 25 MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const uploadRes = await api.post("/admin/upload-video", formData);

      const updateRes = await api.patch("/admin/settings", {
        videoUrl: uploadRes.data.url,
        videoEnabled: true,
      });

      setSettings(updateRes.data);
      setNotice("Video actualizado y habilitado");
    } catch (err) {
      setError(err.response?.data?.message || "Error al subir el video");
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = async (e) => {
    const enabled = e.target.checked;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const res = await api.patch("/admin/settings", {
        videoEnabled: enabled,
      });
      setSettings(res.data);
      setNotice(enabled ? "Video habilitado" : "Video deshabilitado");
    } catch {
      setError("Error al actualizar el video");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setConfirmRemove(false);
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const res = await api.patch("/admin/settings", {
        videoUrl: null,
        videoEnabled: false,
      });
      setSettings(res.data);
      setNotice("Video eliminado");
    } catch {
      setError("Error al quitar el video");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-surface" />
        <div className="h-56 rounded-card bg-surface" />
      </div>
    );
  }

  if (!settings) {
    return (
      <p className="text-center text-sm text-muted">
        No se pudo cargar la configuración del sitio.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 font-heading text-2xl font-bold">Video de fondo</h1>
      <p className="mb-4 text-sm text-muted">
        Se muestra arriba del banner principal del home. MP4 o WebM, máximo
        25 MB.
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {notice && (
        <p className="mb-4 rounded-lg bg-success/10 px-4 py-2 text-sm text-success">
          {notice}
        </p>
      )}

      <div className="rounded-card border border-border bg-card p-5">
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm"
          onChange={handleFile}
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || saving}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={16} />
            {uploading
              ? "Subiendo..."
              : settings.videoUrl
                ? "Reemplazar video"
                : "Subir video"}
          </button>

          {settings.videoUrl && (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-error/30 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={16} />
              Quitar video
            </button>
          )}
        </div>

        <label className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(settings.videoEnabled)}
            onChange={handleToggle}
            disabled={!settings.videoUrl || saving}
          />
          <span className="text-sm">Video habilitado</span>
        </label>

        {settings.videoUrl ? (
          <video
            src={settings.videoUrl}
            controls
            muted
            className="mt-4 max-h-80 w-full rounded-lg bg-black object-contain"
          />
        ) : (
          <p className="mt-4 rounded-lg bg-surface px-4 py-6 text-center text-sm text-muted">
            No hay video cargado.
          </p>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmRemove}
        title="Quitar video"
        message="¿Querés quitar el video del home? El banner va a volver a su posición original."
        confirmLabel="Quitar"
        variant="danger"
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove(false)}
      />
    </div>
  );
}
