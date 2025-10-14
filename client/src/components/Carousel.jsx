import React, { useRef, useState, useEffect } from "react"
import "./carousel.css"

function Carousel({ items, renderItem, cardWidth = 220 }) {
  const carouselRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [cardSize, setCardSize] = useState(cardWidth)

  const computeCardWidth = () => {
    if (typeof window === "undefined") return cardWidth
    const vw = window.innerWidth
    if (vw <= 420) return Math.max(120, Math.min(cardWidth, vw * 0.48))
    if (vw <= 768) return Math.min(cardWidth, vw * 0.36)
    if (vw <= 1024) return Math.min(cardWidth, 200)
    return cardWidth
  }

  const checkForScrollPosition = () => {
    const node = carouselRef.current
    if (!node) return
    setCanScrollLeft(node.scrollLeft > 0)
    setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth)
  }

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return
    const scrollAmount = direction === "left" ? -cardSize * 1.8 : cardSize * 1.8
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  useEffect(() => {
    const node = carouselRef.current
    if (!node) return
    checkForScrollPosition()
    node.addEventListener("scroll", checkForScrollPosition)
    const onResize = () => checkForScrollPosition()
    window.addEventListener("resize", onResize)
    return () => {
      node.removeEventListener("scroll", checkForScrollPosition)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(checkForScrollPosition)
    return () => cancelAnimationFrame(id)
  }, [items])

  useEffect(() => {
    const updateCardSize = () => {
      if (typeof window === "undefined") return
      setCardSize(computeCardWidth())
      checkForScrollPosition()
    }
    updateCardSize()
    window.addEventListener("resize", updateCardSize)
    return () => window.removeEventListener("resize", updateCardSize)
  }, [cardWidth])

  return (
    <div
      className={`carousel-container ${!canScrollLeft ? "at-start" : ""} ${
        !canScrollRight ? "at-end" : ""
      }`}
    >
      <button
        className="carousel-btn left"
        onClick={() => scrollCarousel("left")}
        disabled={!canScrollLeft}
      >
        ❮
      </button>

      <div className="carousel-slider" ref={carouselRef}>
        {items.map((item) => (
          <div
            key={item.id}
            className="carousel-card-wrapper"
            style={{ width: cardSize }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      <button
        className="carousel-btn right"
        onClick={() => scrollCarousel("right")}
        disabled={!canScrollRight}
      >
        ❯
      </button>
    </div>
  )
}

export default Carousel
