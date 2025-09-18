export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#335355",
        color: "#fff",
        padding: "2rem 1rem",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          height:"120px",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        <div style={{ minWidth: "150px", flex: "1" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>
            Movietok <span>©</span>
          </h3>
        </div>

        <div style={{ minWidth: "150px", flex: "1" }}>
          <h4 style={{ marginBottom: "0.5rem" }}>About</h4>
          <p>Learn more</p>
        </div>

        <div style={{ minWidth: "150px", flex: "1" }}>
          <h4 style={{ marginBottom: "0.5rem" }}>Topic</h4>
          <p>Topic 1</p>
        </div>

        <div style={{ minWidth: "150px", flex: "1" }}>
          <h4 style={{ marginBottom: "0.5rem" }}>Topic</h4>
          <p>Topic 2</p>
        </div>
      </div>
    </footer>
  )
}