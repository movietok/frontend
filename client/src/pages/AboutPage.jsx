import "../styles/AboutPage.css"

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">About This Project</h1>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dictum, urna nec
          hendrerit ultrices, justo mauris tincidunt sapien, non vehicula lorem leo in neque.
          Aliquam erat volutpat. Sed facilisis, nulla sed convallis egestas, justo odio bibendum
          eros, vel ultricies massa turpis a neque.
        </p>

        <p>
          Vivamus ac ex nec ipsum vulputate convallis. Integer at odio nec lacus eleifend porta.
          Proin faucibus, justo sit amet gravida vulputate, nunc erat aliquet est, et faucibus
          libero ipsum nec erat. In hac habitasse platea dictumst.
        </p>

        <ul className="about-list">
          <li><strong>Lorem Ipsum API</strong> – sed ut perspiciatis unde omnis iste natus error</li>
          <li><strong>Dolor Sit API</strong> – ut enim ad minima veniam, quis nostrum exercitationem</li>
        </ul>

        <h2 className="about-subtitle">Our Team</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sodales ligula in
          libero. Sed dignissim lacinia nunc, vitae fermentum arcu efficitur non.
        </p>

        <ul className="about-list">
          <li><strong>Lorem Ipsum</strong> – lorem ipsum dolor sit amet</li>
          <li><strong>Dolor Sit</strong> – consectetur adipiscing elit</li>
          <li><strong>Amet Consectetur</strong> – sed do eiusmod tempor incididunt ut labore</li>
          <li><strong>Adipiscing Elit</strong> – ut enim ad minim veniam, quis nostrud exercitation</li>
        </ul>

        <p>
          Mauris non tempor quam, et lacinia sapien. Integer nec ante non orci consectetur tempor.
          Donec ac odio tempor orci dapibus ultrices in iaculis nunc.
        </p>

        <p className="about-footer">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit 🎬
        </p>
      </div>
    </div>
  )
}
