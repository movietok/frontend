import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../services/groupService";
import { getAllGroupThemes } from "../services/groups";
import { getGenres } from "../services/tmdb";
import GenreSelector from "../components/GenreSelector";

export default function CreateGroupPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState([]);                // [{ id:"28", name:"Action" }, ...]
  const [selectedGenres, setSelectedGenres] = useState([]); // ["28","99"]
  const [themes, setThemes] = useState([]);                // [{ id, name, theme }]
  const [themeId, setThemeId] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Normalize genre IDs to strings (same as Browse pages)
    getGenres()
      .then((data) => {
        const normalized = (data.genres || []).map((g) => ({
          id: String(g.id),
          name: g.name,
        }));
        setGenres(normalized);
      })
      .catch(console.error);

    getAllGroupThemes()
      .then((data) => setThemes(data.themes || []))
      .catch(console.error);
  }, []);

  // Toggle using string IDs so .includes works predictably
  const toggleGenre = (gid) => {
    const idStr = String(gid);
    setSelectedGenres((prev) =>
      prev.includes(idStr) ? prev.filter((x) => x !== idStr) : [...prev, idStr]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      visibility,                                 // "public" | "private"
      theme_id: themeId ? Number(themeId) : null, // FK to group_themes.id
      // If backend isn't ready for genres yet, comment the next line temporarily:
      tags: selectedGenres.map((id) => Number(id)),
    };

    try {
      setSubmitting(true);
      console.log("[CreateGroup] payload →", payload); // debug

      const created = await createGroup(payload);
      console.log("[CreateGroup] response →", created); // debug

      // Support either shape: {id,...} or {group:{id,...}}
      const newId = created?.id || created?.group?.id;
      if (!newId) {
        throw new Error("Create response missing group id");
      }
      navigate(`/groups/${newId}`);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("CreateGroup failed:", status, data, err?.message);

      // Surface the most helpful message
      const msg =
        status === 401
          ? "You must be logged in to create a group."
          : data?.error || data?.message || err?.message || "Failed to create group.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">Create a New Group</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium mb-1">Theme</label>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Theme --</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Genres */}
        <div>
          <label className="block text-sm font-medium mb-1">Genres</label>
          <GenreSelector
            genres={genres}
            selectedGenres={selectedGenres}
            onToggle={toggleGenre}
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium mb-1">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 text-white rounded ${
            submitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {submitting ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
}
