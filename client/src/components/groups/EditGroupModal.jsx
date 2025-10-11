import { useEffect, useMemo, useState } from "react";
import { updateGroup } from "../../services/groupService";
import { getAllGroupThemes } from "../../services/groups";
import { getGenres } from "../../services/tmdb";
import GenreSelector from "../GenreSelector";
import OnsitePopup from "../Popups/OnsitePopup";
import "../../styles/EditGroupModal.css";

export default function EditGroupModal({ group, onClose, onSave }) {
  useEffect(() => {
    console.log("🟣 EditGroupModal mounted");
    console.log("group prop in modal:", group);
  }, []);

  // Base fields
  const [name, setName] = useState(group.name || "");
  const [description, setDescription] = useState(group.description || "");
  const [visibility, setVisibility] = useState(group.visibility || "public");

  // Themes
  const [themes, setThemes] = useState([]); // [{ id, name, theme }]
  const [themeId, setThemeId] = useState(
    group.theme_id == null ? "" : String(group.theme_id)
  );

  // Genres
  const [genres, setGenres] = useState([]); // [{ id:"28", name:"Action" }, ...]
  const [selectedGenres, setSelectedGenres] = useState([]); // ["28","99"]

  const groupId = useMemo(
    () => group?.id || group?.gID || group?.group?.id,
    [group]
  );

  // === On-site Popup states ===
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");

  useEffect(() => {
    // Load genres (TMDB) and seed selected genres
    getGenres()
      .then((data) => {
        const normalized = (data.genres || []).map((g) => ({
          id: String(g.id),
          name: g.name,
        }));
        setGenres(normalized);

        // Seed from ids first; else try mapping names -> ids
        if (Array.isArray(group.tags) && group.tags.length) {
          setSelectedGenres(group.tags.map((n) => String(n)));
        } else if (Array.isArray(group.genre_tags) && group.genre_tags.length) {
          const byName = new Map(
            normalized.map((g) => [g.name.toLowerCase(), String(g.id)])
          );
          const mapped = group.genre_tags
            .map((name) => byName.get(String(name).toLowerCase()))
            .filter(Boolean);
          setSelectedGenres(mapped);
        } else {
          setSelectedGenres([]);
        }
      })
      .catch(console.error);

    // Load themes
    getAllGroupThemes()
      .then((data) => setThemes(data.themes || []))
      .catch(console.error);
  }, [group]);

  const toggleGenre = (gid) => {
    const idStr = String(gid);
    setSelectedGenres((prev) =>
      prev.includes(idStr) ? prev.filter((x) => x !== idStr) : [...prev, idStr]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build minimal updates — only send changed fields
    const updates = {};
    const safeTrim = (s) => (typeof s === "string" ? s.trim() : s);

    // name
    const newName = safeTrim(name);
    const oldName = safeTrim(group.name ?? "");
    if (newName && newName !== oldName) updates.name = newName;

    // description (allow empty string to clear)
    const newDesc = description ?? "";
    const oldDesc = group.description ?? "";
    if (newDesc !== oldDesc) updates.description = newDesc;

    // visibility (only "public" | "private" in UI)
    if (visibility && visibility !== group.visibility) {
      updates.visibility = visibility;
    }

    // theme_id: number or null; never send ""
    const oldTheme = group.theme_id == null ? null : Number(group.theme_id);
    const newTheme =
      themeId === ""
        ? null
        : Number.isNaN(Number(themeId))
        ? oldTheme
        : Number(themeId);
    if (newTheme !== oldTheme) updates.theme_id = newTheme;

    // tags: send only if they actually changed (including clearing)
    const numericTags = selectedGenres
      .map((id) => Number(id))
      .filter((n) => Number.isInteger(n) && n > 0);

    const currentTags =
      Array.isArray(group.tags) && group.tags.length
        ? group.tags.map((n) => Number(n)).filter(Number.isInteger)
        : [];

    const eqSets = (a, b) => {
      if (a.length !== b.length) return false;
      const A = new Set(a);
      for (const v of b) if (!A.has(v)) return false;
      return true;
    };

    if (!eqSets(numericTags, currentTags)) {
      updates.tags = numericTags; // [] means "clear all" intentionally
    }

    // Nothing changed?
    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    try {
      const updated = await updateGroup(groupId, updates);

      // ✅ Replace alert with styled popup
      setPopupMessage("Group updated successfully!");
      setPopupType("success");
      setShowPopup(true);

      onSave?.(updated?.group ?? updated);

      onClose();
      setTimeout(() => {
        setShowPopup(false);
        onClose();
      }, 2000);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("Update failed:", status, data, err?.message);
      const msg =
        data?.error ||
        data?.message ||
        err?.message ||
        "Failed to update group.";

      // ❌ Replace alert with styled popup
      setPopupMessage(msg);
      setPopupType("error");
      setShowPopup(true);
    }
  };

  return (
  <div className="edit-group-overlay">
    <div className="edit-group-modal">
      <h3>Edit Group</h3>

      <form onSubmit={handleSubmit}>
        {/* === Group Name === */}
        <div>
          <label>Group Name</label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            required
          />
        </div>

        {/* === Description === */}
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group description"
          />
        </div>

        {/* === Theme === */}
        <div>
          <label>Theme</label>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
          >
            <option value="">-- No theme --</option>
            {themes.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* === Genres === */}
        <div>
          <GenreSelector
            genres={genres}
            selectedGenres={selectedGenres}
            onToggle={toggleGenre}
          />
        </div>

        {/* === Visibility === */}
<div className="visibility-field">
  <label htmlFor="visibility">Visibility</label>
  <select
    id="visibility"
    name="visibility"
    value={visibility}
    onChange={(e) => setVisibility(e.target.value)}
  >
    <option value="public">Public</option>
    <option value="private">Private</option>
  </select>
</div>

        {/* === Actions === */}
        <div className="edit-group-actions">
          <button
            type="button"
            onClick={onClose}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btn"
          >
            Save
          </button>
        </div>
      </form>
    </div>

    {/* === On-site Popup integration === */}
    {showPopup && (
      <OnsitePopup
        message={popupMessage}
        type={popupType}
        onConfirm={() => setShowPopup(false)}
        confirmText="OK"
      />
    )}
  </div>
);
}
