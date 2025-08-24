export async function downloadImage(url: string, filename?: string) {
  try {
    const res = await fetch(url, { mode: "cors" })
    if (!res.ok) throw new Error(`fetch failed ${res.status}`)

    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")

    a.href = blobUrl
    a.download = filename || "image"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  } catch (err) {
    console.warn("downloadImage fallback", err)
    window.open(url, "_blank")
  }
}
