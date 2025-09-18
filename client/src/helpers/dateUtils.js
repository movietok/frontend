export const getCurrentDate = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, "0")
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    return `${day}.${month}.${year}`
}

export const parseFinnkinoDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null

    // Try ISO format first
    const isoParsed = new Date(dateStr)
    if (!isNaN(isoParsed.getTime())) return isoParsed

    // Try localized format: "dd.mm.yyyy hh:mm"
    const [datePart, timePart] = dateStr.trim().split(" ")
    if (!datePart || !timePart) return null

    const [day, month, year] = datePart.split(".")
    if (!day || !month || !year) return null

    const fallbackParsed = new Date(`${year}-${month}-${day}T${timePart}`)
    return isNaN(fallbackParsed.getTime()) ? null : fallbackParsed
}
