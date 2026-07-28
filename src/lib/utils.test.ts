import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"
import { formatRupiah } from "@/lib/constants"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("handles tailwind conflicts", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
  })
})

describe("formatRupiah", () => {
  it("formats numbers correctly", () => {
    expect(formatRupiah(65000)).toBe("Rp 65.000")
  })

  it("handles zero", () => {
    expect(formatRupiah(0)).toBe("Rp 0")
  })

  it("handles large numbers", () => {
    expect(formatRupiah(1000000)).toBe("Rp 1.000.000")
  })
})
