function GenreSelector({ genres, selectedGenres, onToggle }) {
  // inline styles override any global css that might be interfering
  const activeStyle = { backgroundColor: "#2563eb", borderColor: "#2563eb", color: "#fff" };
  const inactiveStyle = { backgroundColor: "transparent", borderColor: "#6b7280", color: "#e5e7eb" };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Genres</h2>

      <div className="flex flex-wrap gap-3">
        {genres.map((genre) => {
          const active = selectedGenres.includes(genre.id);
          return (
            <button
              key={genre.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(genre.id)}
              style={active ? activeStyle : inactiveStyle}
              className="px-3 py-1 rounded-full border text-sm transition"
            >
              {genre.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GenreSelector;
